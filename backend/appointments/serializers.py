from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from doctors.serializers import DoctorSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = DoctorSerializer(source='doctor', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
