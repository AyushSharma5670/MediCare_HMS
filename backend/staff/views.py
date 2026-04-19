from rest_framework import viewsets
from .models import Staff
from .serializers import StaffSerializer
from rest_framework.permissions import IsAuthenticated

class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    permission_classes = [IsAuthenticated]
