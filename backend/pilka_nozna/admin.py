from django.contrib import admin
from .models import Turniej, Druzyna, Mecz


@admin.register(Turniej)
class TurniejAdmin(admin.ModelAdmin):
    list_display = (
        'nazwa',
        'typ',
        'liczba_druzyn',
        'data_rozpoczecia',
        'data_zakonczenia',
        'miejsce'
    )
    search_fields = ('nazwa', 'miejsce')
    list_filter = ('typ',)
    ordering = ('-data_utworzenia',)


@admin.register(Druzyna)
class DruzynaAdmin(admin.ModelAdmin):
    list_display = ('nazwa', 'turniej')
    search_fields = ('nazwa',)
    ordering = ('turniej', 'nazwa')


@admin.register(Mecz)
class MeczAdmin(admin.ModelAdmin):
    list_display = (
        'turniej',
        'druzyna_a',
        'druzyna_b',
        'data',
        'godzina',
        'miejsce',
        'wynik_a',
        'wynik_b',
        'runda'
    )
    list_filter = ('turniej', 'data', 'runda')
    search_fields = ('miejsce', 'runda')
    ordering = ('data', 'godzina')
