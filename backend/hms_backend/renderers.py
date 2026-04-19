from rest_framework.renderers import JSONRenderer

class CustomJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response_data = {}
        
        # If response is already wrapped as an error from exception handler, just return it
        if isinstance(data, dict) and data.get("status") in ["error", "success"]:
            return super().render(data, accepted_media_type, renderer_context)
            
        status_code = renderer_context['response'].status_code if renderer_context else 200
        
        if status_code >= 400:
            response_data = {
                "status": "error",
                "message": "An error occurred",
                "errors": data,
                "data": None
            }
        else:
            response_data = {
                "status": "success",
                "message": "Request successful",
                "data": data,
                "errors": None
            }
            
        return super().render(response_data, accepted_media_type, renderer_context)
