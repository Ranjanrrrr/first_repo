# Generated by Django 5.2.3 on 2025-06-24 12:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='account',
            name='code',
            field=models.CharField(default=0, max_length=50),
        ),
    ]
