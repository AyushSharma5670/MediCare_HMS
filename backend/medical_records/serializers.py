from rest_framework import serializers
from .models import MedicalRecord
from patients.serializers import PatientSerializer
from doctors.serializers import DoctorSerializer
from appointments.serializers import AppointmentSerializer

class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = DoctorSerializer(source='doctor', read_only=True)
    appointment_details = AppointmentSerializer(source='appointment', read_only=True)

    class Meta:
        model = MedicalRecord
        fields = '__all__'
