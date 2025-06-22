from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User


class Turniej(models.Model):
    TYPY_TURNIEJU = [
        ('liga', 'Liga'),
        ('puchar', 'Puchar'),
    ]

    nazwa = models.CharField(max_length=100)
    typ = models.CharField(max_length=10, choices=TYPY_TURNIEJU)
    liczba_druzyn = models.PositiveIntegerField()
    data_utworzenia = models.DateTimeField(auto_now_add=True)
    data_rozpoczecia = models.DateField(null=True, blank=True)
    data_zakonczenia = models.DateField(null=True, blank=True)
    miejsce = models.CharField(max_length=100, null=True, blank=True)
    wlasciciel = models.ForeignKey(User, on_delete=models.CASCADE, related_name='turnieje', null=True)

    def clean(self):
        if self.liczba_druzyn < 2 or self.liczba_druzyn > 32:
            raise ValidationError("Liczba drużyn musi zawierać się w przedziale od 2 do 32.")
        if self.typ == 'puchar':
            if (self.liczba_druzyn & (self.liczba_druzyn - 1)) != 0:
                raise ValidationError("W pucharze liczba drużyn musi być potęgą liczby 2 (np. 4, 8, 16, 32).")

    def __str__(self):
        return f"{self.nazwa} ({self.typ})"

    class Meta:
        verbose_name = "Turniej"
        verbose_name_plural = "Turnieje"


class Druzyna(models.Model):
    nazwa = models.CharField(max_length=100)
    turniej = models.ForeignKey(Turniej, on_delete=models.CASCADE, related_name='druzyny')

    def __str__(self):
        return self.nazwa

    class Meta:
        verbose_name = "Drużyna"
        verbose_name_plural = "Drużyny"
        unique_together = ('nazwa', 'turniej')


class Mecz(models.Model):
    turniej = models.ForeignKey(Turniej, on_delete=models.CASCADE)
    druzyna_a = models.ForeignKey(Druzyna, on_delete=models.CASCADE, related_name='mecz_a')
    druzyna_b = models.ForeignKey(Druzyna, on_delete=models.CASCADE, related_name='mecz_b')
    data = models.DateField(null=True, blank=True)
    godzina = models.TimeField(null=True, blank=True)
    miejsce = models.CharField(max_length=100, blank=True)
    wynik_a = models.IntegerField(null=True, blank=True)
    wynik_b = models.IntegerField(null=True, blank=True)
    runda = models.CharField(max_length=50, blank=True)

    def clean(self):
        if self.druzyna_a == self.druzyna_b:
            raise ValidationError("Drużyny w meczu muszą być różne.")

    def __str__(self):
        return f"{self.druzyna_a} vs {self.druzyna_b}"

    class Meta:
        verbose_name = "Mecz"
        verbose_name_plural = "Mecze"
        ordering = ['data', 'godzina', 'id']
