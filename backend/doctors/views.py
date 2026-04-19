from rest_framework import viewsets
from .models import Doctor
from .serializers import DoctorSerializer
from rest_framework.permissions import IsAuthenticated

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        user = instance.user
        instance.delete()
        user.delete()
