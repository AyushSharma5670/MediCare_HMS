from rest_framework import serializers
from .models import Patient
from users.serializers import UserSerializer

class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Patient
        fields = '__all__'
