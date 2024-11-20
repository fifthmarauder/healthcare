from django.urls import path
from .views import translate_text_openai, index

urlpatterns = [
    path("", index, name="index"),
    path("translate_openai/", translate_text_openai, name="translate_openai"),
]