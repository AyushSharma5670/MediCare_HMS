from rest_framework import viewsets
from .models import Patient
from .serializers import PatientSerializer
from rest_framework.permissions import IsAuthenticated

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        user = instance.user
        instance.delete()
        user.delete()
