from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Appointment
from .serializers import AppointmentSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') in ['Admin', 'Staff']:
            return Appointment.objects.all()
        elif getattr(user, 'role', '') == 'Doctor':
            return Appointment.objects.filter(doctor__user=user)
        elif getattr(user, 'role', '') == 'Patient':
            return Appointment.objects.filter(patient__user=user)
        return Appointment.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        # Automatically assign patient if the user creating is a patient
        if getattr(user, 'role', '') == 'Patient' and hasattr(user, 'patient_profile'):
            serializer.save(patient=user.patient_profile)
        else:
            serializer.save()
