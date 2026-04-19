from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from doctors.views import DoctorViewSet
from patients.views import PatientViewSet
from staff.views import StaffViewSet
from appointments.views import AppointmentViewSet
from medical_records.views import MedicalRecordViewSet
from users.views import CustomTokenObtainPairView, RegisterView, UserProfileView, ChangePasswordView
from users.onboarding_views import OnboardDoctorView, OnboardStaffView, OnboardPatientView
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'staff', StaffViewSet, basename='staff')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'records', MedicalRecordViewSet, basename='record')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth endpoints
    path('api/users/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/register/', RegisterView.as_view(), name='register'),
    path('api/users/profile/', UserProfileView.as_view(), name='profile'),
    path('api/users/change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Onboarding endpoints
    path('api/onboard/doctor/', OnboardDoctorView.as_view(), name='onboard_doctor'),
    path('api/onboard/staff/', OnboardStaffView.as_view(), name='onboard_staff'),
    path('api/onboard/patient/', OnboardPatientView.as_view(), name='onboard_patient'),

    # App endpoints
    path('api/', include(router.urls)),
]
