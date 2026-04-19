from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import MedicalRecord
from .serializers import MedicalRecordSerializer

class MedicalRecordViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') in ['Admin', 'Staff']:
            return MedicalRecord.objects.all()
        elif getattr(user, 'role', '') == 'Doctor':
            return MedicalRecord.objects.filter(doctor__user=user)
        elif getattr(user, 'role', '') == 'Patient':
            return MedicalRecord.objects.filter(patient__user=user)
        return MedicalRecord.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        # Automatically assign doctor if the user creating is a doctor
        if getattr(user, 'role', '') == 'Doctor' and hasattr(user, 'doctor_profile'):
            serializer.save(doctor=user.doctor_profile)
        else:
            serializer.save()
