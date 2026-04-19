from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        return Response({
            "status": "error",
            "message": "An error occurred.",
            "errors": response.data,
            "data": None
        }, status=response.status_code)

    # For exceptions not handled by DRF (e.g., 500s), you can handle them here or let Django's 500 handler take over
    return None
