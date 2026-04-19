from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model
from django.db import transaction
from doctors.models import Doctor
from patients.models import Patient
from staff.models import Staff

User = get_user_model()

class OnboardDoctorView(views.APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def post(self, request):
        data = request.data
        try:
            # Create user
            user = User.objects.create_user(
                username=data.get('username'),
                password=data.get('password'),
                email=data.get('email'),
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                phone_number=data.get('phone_number', ''),
                role='Doctor'
            )
            
            # Create profile
            doctor = Doctor.objects.create(
                user=user,
                specialization=data.get('specialization', ''),
                license_number=data.get('license_number', ''),
                experience_years=data.get('experience_years', 0)
            )
            
            return Response({'message': 'Doctor onboarded successfully', 'doctor_id': doctor.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class OnboardStaffView(views.APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def post(self, request):
        data = request.data
        try:
            user = User.objects.create_user(
                username=data.get('username'),
                password=data.get('password'),
                email=data.get('email'),
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                phone_number=data.get('phone_number', ''),
                role='Staff'
            )
            
            staff = Staff.objects.create(
                user=user,
                department=data.get('department', ''),
                shift_timing=data.get('shift_timing', '')
            )
            
            return Response({'message': 'Staff onboarded successfully', 'staff_id': staff.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class OnboardPatientView(views.APIView):
    permission_classes = [IsAuthenticated] # Admin or Staff

    @transaction.atomic
    def post(self, request):
        # Only Admin or Staff should register full patients internally
        if request.user.role not in ['Admin', 'Staff']:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
            
        data = request.data
        try:
            user = User.objects.create_user(
                username=data.get('username'),
                password=data.get('password'),
                email=data.get('email'),
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                phone_number=data.get('phone_number', ''),
                role='Patient'
            )
            
            patient = Patient.objects.create(
                user=user,
                date_of_birth=data.get('date_of_birth') or None,
                gender=data.get('gender', ''),
                blood_group=data.get('blood_group', ''),
                address=data.get('address', '')
            )
            
            return Response({'message': 'Patient registered successfully', 'patient_id': patient.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
