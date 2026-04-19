from rest_framework import serializers
from .models import Staff
from users.serializers import UserSerializer

class StaffSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Staff
        fields = '__all__'
