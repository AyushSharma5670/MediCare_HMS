from django.db import models
from django.conf import settings

class Staff(models.Model):
    DEPARTMENT_CHOICES = (
        ('Reception', 'Reception'),
        ('Pharmacy', 'Pharmacy'),
        ('Laboratory', 'Laboratory'),
        ('HR', 'HR'),
        ('Other', 'Other'),
    )
    SHIFT_CHOICES = (
        ('Morning', 'Morning'),
        ('Evening', 'Evening'),
        ('Night', 'Night'),
    )
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='staff_profile')
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, default='Reception')
    shift_timing = models.CharField(max_length=20, choices=SHIFT_CHOICES, default='Morning')

    def __str__(self):
        return f"Staff: {self.user.get_full_name() or self.user.username} - {self.department}"
