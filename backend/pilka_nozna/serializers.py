from rest_framework import serializers
from .models import Turniej, Druzyna, Mecz


class TurniejSerializer(serializers.ModelSerializer):
    druzyny_count = serializers.SerializerMethodField()

    class Meta:
        model = Turniej
        fields = '__all__'

    def get_druzyny_count(self, obj):
        return obj.druzyny.count()


class DruzynaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Druzyna
        fields = '__all__'

    def validate(self, data):
        turniej = data['turniej']
        nazwa = data['nazwa']
        is_update = self.instance is not None

        # Sprawdź unikalność tylko jeśli to dodawanie lub zmiana nazwy
        if not is_update or self.instance.nazwa != nazwa:
            if Druzyna.objects.filter(turniej=turniej, nazwa=nazwa).exclude(id=getattr(self.instance, 'id', None)).exists():
                raise serializers.ValidationError(
                    f"Drużyna o nazwie '{nazwa}' już istnieje w tym turnieju."
                )

        # Limit sprawdzaj tylko przy dodawaniu
        if not is_update:
            if turniej.druzyny.count() >= turniej.liczba_druzyn:
                raise serializers.ValidationError(
                    f"Osiągnięto limit drużyn ({turniej.liczba_druzyn}) dla tego turnieju."
                )

        return data



class MeczSerializer(serializers.ModelSerializer):
    druzyna_a_nazwa = serializers.CharField(source='druzyna_a.nazwa', read_only=True)
    druzyna_b_nazwa = serializers.CharField(source='druzyna_b.nazwa', read_only=True)

    class Meta:
        model = Mecz
        fields = '__all__'
