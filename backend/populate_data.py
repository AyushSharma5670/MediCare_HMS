import os
import django
from datetime import date, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from doctors.models import Doctor
from patients.models import Patient
from staff.models import Staff
from appointments.models import Appointment

User = get_user_model()

def populate():
    print("Populating sample data...")

    # Create Admin User
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser('admin', 'admin@hms.com', 'admin123')
        admin.role = 'Admin'
        admin.save()
        print("Created admin user.")

    # Create Doctor User
    if not User.objects.filter(username='doctor1').exists():
        doc_user = User.objects.create_user('doctor1', 'doctor@hms.com', 'doc123')
        doc_user.role = 'Doctor'
        doc_user.first_name = 'John'
        doc_user.last_name = 'Doe'
        doc_user.save()
        Doctor.objects.create(user=doc_user, specialization='Cardiologist', license_number='LIC12345', experience_years=10)
        print("Created doctor user.")

    # Create Patient User
    if not User.objects.filter(username='patient1').exists():
        pat_user = User.objects.create_user('patient1', 'patient@hms.com', 'pat123')
        pat_user.role = 'Patient'
        pat_user.first_name = 'Alice'
        pat_user.last_name = 'Smith'
        pat_user.save()
        Patient.objects.create(user=pat_user, date_of_birth=date(1990, 5, 20), gender='Female', blood_group='O+')
        print("Created patient user.")

    # Create Staff User
    if not User.objects.filter(username='staff1').exists():
        staff_user = User.objects.create_user('staff1', 'staff@hms.com', 'staff123')
        staff_user.role = 'Staff'
        staff_user.first_name = 'Bob'
        staff_user.last_name = 'Jones'
        staff_user.save()
        Staff.objects.create(user=staff_user, department='Reception', shift_timing='Morning')
        print("Created staff user.")

    # Create Appointment
    doc = Doctor.objects.first()
    pat = Patient.objects.first()
    if doc and pat and not Appointment.objects.exists():
        Appointment.objects.create(
            patient=pat,
            doctor=doc,
            appointment_datetime=timezone.now() + timedelta(days=1),
            status='Scheduled',
            reason_for_visit='Routine checkup'
        )
        print("Created sample appointment.")

    print("Data population complete!")

if __name__ == '__main__':
    populate()
