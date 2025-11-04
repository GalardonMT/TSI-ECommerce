import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class CustomComplexityValidator:
    def __init__(self, min_length=8):
        self.min_length = int(min_length)

    def validate(self, password, user=None):
        errores = []
        if len(password) < self.min_length:
            errores.append(_("La contraseña debe tener al menos %(min_length)d caracteres.") % {"min_length": self.min_length})
        if not re.search(r"[A-Z]", password):
            errores.append(_("Debe contener al menos una letra mayúscula."))
        if not re.search(r"[a-z]", password):
            errores.append(_("Debe contener al menos una letra minúscula."))
        if not re.search(r"\d", password):
            errores.append(_("Debe contener al menos un número."))

        if errores:
            raise ValidationError(errores)

    def get_help_text(self):
        return _("Su contraseña debe tener al menos %(min_length)d caracteres y contener mayúsculas, minúsculas y números.") % {"min_length": self.min_length}
