from django.db import models
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment

class MedicalRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='medical_records')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='medical_records')
    diagnosis = models.CharField(max_length=255)
    prescription = models.TextField(blank=True, null=True)
    treatment_plan = models.TextField(blank=True, null=True)
    date_recorded = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Record for {self.patient.user.username} by Dr. {self.doctor.user.username} on {self.date_recorded.strftime('%Y-%m-%d')}"
