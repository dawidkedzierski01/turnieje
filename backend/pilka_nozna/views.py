from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Turniej, Druzyna, Mecz
from .serializers import TurniejSerializer, DruzynaSerializer, MeczSerializer

from itertools import combinations
import random

RUNDY = {
    64: '1/32',
    32: '1/16',
    16: '1/8',
    8: 'Ćwierćfinał',
    4: 'Półfinał',
    2: 'Finał',
}
RUNDY_ODWROTNE = {v: k for k, v in RUNDY.items()}

class TurniejViewSet(viewsets.ModelViewSet):
    queryset = Turniej.objects.all()
    serializer_class = TurniejSerializer

    def get_queryset(self):
        return Turniej.objects.filter(wlasciciel=self.request.user)

    def perform_create(self, serializer):
        serializer.save(wlasciciel=self.request.user)


class DruzynaViewSet(viewsets.ModelViewSet):
    queryset = Druzyna.objects.all()
    serializer_class = DruzynaSerializer


@api_view(['POST'])
def generuj_mecze(request, turniej_id):
    try:
        turniej = Turniej.objects.get(id=turniej_id)
    except Turniej.DoesNotExist:
        return Response({'error': 'Turniej nie został znaleziony'}, status=404)

    if Mecz.objects.filter(turniej=turniej).exists():
        return Response({'error': 'Mecze dla tego turnieju zostały już wygenerowane'}, status=400)

    druzyny = list(Druzyna.objects.filter(turniej=turniej))
    if len(druzyny) < 2:
        return Response({'error': 'Za mało drużyn, aby wygenerować mecze'}, status=400)

    if turniej.typ == 'liga':
        teams = druzyny.copy()
        if len(teams) % 2 == 1:
            teams.append(None)

        num_teams = len(teams)
        num_rounds = num_teams - 1
        half = num_teams // 2

        for round_num in range(num_rounds):
            for i in range(half):
                team1 = teams[i]
                team2 = teams[num_teams - 1 - i]
                if team1 is not None and team2 is not None:
                    Mecz.objects.create(
                        turniej=turniej,
                        druzyna_a=team1,
                        druzyna_b=team2,
                        runda=str(round_num + 1)
                    )
            teams = [teams[0]] + [teams[-1]] + teams[1:-1]

    elif turniej.typ == 'puchar':
        if len(druzyny) & (len(druzyny) - 1) != 0:
            return Response({'error': 'Liczba drużyn w pucharze musi być potęgą dwójki'}, status=400)
        random.shuffle(druzyny)
        pary = [(druzyny[i], druzyny[i + 1]) for i in range(0, len(druzyny), 2)]
        runda_startowa = RUNDY.get(len(druzyny), f'1/{len(druzyny)}')
        for a, b in pary:
            Mecz.objects.create(turniej=turniej, druzyna_a=a, druzyna_b=b, runda=runda_startowa)
    else:
        return Response({'error': 'Nieznany typ turnieju'}, status=400)

    total_matches = Mecz.objects.filter(turniej=turniej).count()
    return Response({'message': f'Utworzono {total_matches} meczów'}, status=201)


@api_view(['POST'])
def zatwierdz_kolejke(request, turniej_id):
    try:
        turniej = Turniej.objects.get(id=turniej_id)
    except Turniej.DoesNotExist:
        return Response({'error': 'Turniej nie został znaleziony'}, status=404)

    rozegrane = Mecz.objects.filter(turniej=turniej).order_by('id')
    if not rozegrane:
        return Response({'error': 'Brak meczów'}, status=400)

    rundy = sorted(set(m.runda for m in rozegrane if m.runda))
    ostatnia_runda = rundy[-1]
    mecze_ostatniej = [m for m in rozegrane if m.runda == ostatnia_runda]

    mecze_z_wynikiem = [m for m in mecze_ostatniej if m.wynik_a is not None and m.wynik_b is not None]
    if len(mecze_z_wynikiem) < len(mecze_ostatniej):
        return Response({'error': 'Wszystkie mecze muszą mieć wyniki'}, status=400)

    rozstrzygniete = [m for m in mecze_z_wynikiem if m.wynik_a != m.wynik_b]
    if len(rozstrzygniete) < len(mecze_ostatniej):
        return Response({'error': 'Nie wszystkie mecze mają rozstrzygnięcie (bez remisów)'}, status=400)

    zwyciezcy = []
    for m in rozstrzygniete:
        zwyciezcy.append(m.druzyna_a if m.wynik_a > m.wynik_b else m.druzyna_b)

    if len(zwyciezcy) == 1:
        return Response({'message': 'Turniej zakończony – zwycięzca został wyłoniony'}, status=200)

    if len(zwyciezcy) % 2 != 0:
        return Response({'error': 'Nieparzysta liczba zwycięzców – nie można utworzyć pełnych par'}, status=400)

    aktualna_liczba = RUNDY_ODWROTNE.get(ostatnia_runda)
    if not aktualna_liczba:
        return Response({'error': 'Nieznana runda'}, status=400)

    nastepna_liczba = aktualna_liczba // 2
    nowa_runda = RUNDY.get(nastepna_liczba, f'1/{nastepna_liczba}')

    # Sprawdź, czy runda już istnieje i czy odpowiada tym parom
    istniejace = list(Mecz.objects.filter(turniej=turniej, runda=nowa_runda))
    if istniejace:
        istniejace_pary = sorted((min(m.druzyna_a.id, m.druzyna_b.id), max(m.druzyna_a.id, m.druzyna_b.id)) for m in istniejace)
        nowe_pary = sorted((min(zwyciezcy[i].id, zwyciezcy[i + 1].id), max(zwyciezcy[i].id, zwyciezcy[i + 1].id)) for i in range(0, len(zwyciezcy), 2))

        if istniejace_pary == nowe_pary:
            return Response({'message': 'Runda już istnieje i jest aktualna'}, status=200)
        else:
            # Nadpisz błędną rundę
            for m in istniejace:
                m.delete()

    random.shuffle(zwyciezcy)
    pary = [(zwyciezcy[i], zwyciezcy[i + 1]) for i in range(0, len(zwyciezcy), 2)]
    for a, b in pary:
        Mecz.objects.create(turniej=turniej, druzyna_a=a, druzyna_b=b, runda=nowa_runda)

    return Response({
        'message': f'Utworzono {len(pary)} meczów rundy: {nowa_runda}',
        'runda': nowa_runda
    }, status=201)


@api_view(['DELETE'])
def resetuj_mecze(request, turniej_id):
    try:
        turniej = Turniej.objects.get(id=turniej_id)
    except Turniej.DoesNotExist:
        return Response({'error': 'Turniej nie został znaleziony'}, status=404)

    liczba = Mecz.objects.filter(turniej=turniej).count()
    Mecz.objects.filter(turniej=turniej).delete()

    return Response({'message': f'Usunięto {liczba} meczów'})


class MeczViewSet(viewsets.ModelViewSet):
    queryset = Mecz.objects.all().order_by('id')
    serializer_class = MeczSerializer

    def get_queryset(self):
        turniej_id = self.request.query_params.get('turniej')
        if turniej_id:
            return Mecz.objects.filter(turniej__id=turniej_id).order_by('id')
        return super().get_queryset().order_by('id')
