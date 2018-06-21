export class Validacion {

  static getValidatorMensajeError(code: string): any {
    let config = {
      'required': 'Este campo es requerido',
      'invalidEmailAddress': 'Correo electrónico inválido',
      'invalidPassword': 'Contraseña inválida, debe contener al menos 6 caracteres' +
      ' un número, letras mayúsculas y minúsculas',
      'invalidNumero': 'Sólo admite números',
      'invalidLetras': 'Sólo admite letras',  //no
      'invalidLetrasNumeros': 'Sólo admite letras y números',
      'invalidLetrasWithoutSpace': 'Sólo admite letras sin espacio',
      'invalidLetrasNumerosWithoutSpace': 'Sólo admite letras y números sin espacio',
      'invalidCurp': 'CURP Inválida',
      'invalidNumeroTelefonico': 'Teléfono incorrecto (0-00-00-00) o (000-000-0000)',
      'invalidCaracter': 'Caracteres no validos',
      'invalidLetrasNumerosAcentoPuntoComa':
        'Sólo admite letras, números, ".", ",", ":", "-" y espacio',
      'invalidNumerosFloat': 'El formato es: 100.00',
      'invalidNumerosCantidad': 'Cantidad inválida',
      'invalidAnio': 'El formato es: YYYY',
      'invalidRFC': 'RFC Inválido',
      'invalidCalificacion': 'La calificación debe ser un número entero entre 0 y 100',
      'invalidHours': 'El número de horas debe estar entre 1 y 80',
      'invalidCalificacionEvaluacion': 'La calificación debe de estar dentro del rango de 0 y 10',
      'invalidCalificacionRecurso': 'La calificación debe ser un número entero entre 0 y 80'
    };
    return config[code];
  }

  static emailValidator(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '[-!#$%&\'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&\'*+/0-9=?A-Z^_a-z{|}~])*' +
      '@[a-zA-Z](-?[a-zA-Z0-9])*(\.[a-zA-Z](-?[a-zA-Z0-9])*)+';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidEmailAddress': true };
    }
  }
  static passwordValidator(control): {[key: string]: boolean} {
    let patron: string = '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidPassword': true };
    }
  }

  static numerosValidator(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '([0-9]{1,}[]{0,}){0,}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidNumero': true };
    }
  }

  static letrasNumerosValidator(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '([a-zA-Z0-9]{1,}[ ]{0,}){0,}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidLetrasNumeros': true };
    }
  }

  static letrasNumerosSinEspacioValidator(control): { [key: string]: boolean } {
    if (!control.value) {
      return null;
    }
    let patron: string = '([a-zA-Z0-9]{1,}){0,}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidLetrasNumerosWithoutSpace': true };
    }
  }

  static letrasValidator(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '([a-zA-ZñáéíóúÑÁÉÍÓÚ.]{1,}[ ]{0,}){0,}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidLetras': true };
    }
  }

  static letrasSinEspacioValidator(control): { [key: string]: boolean } {
    if (!control.value) {
      return null;
    }
    let patron: string = '([a-zA-Z]{1,}){0,}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidLetrasWithoutSpace': true };
    }
  }
  // este metodo esta repetido pero no sé cuantas veces se use por eso lo deje
  static emailValidatorOptional(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '[-!#$%&\'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&\'*+/0-9=?A-Z^_a-z{|}~])*' +
      '@[a-zA-Z](-?[a-zA-Z0-9])*(\.[a-zA-Z](-?[a-zA-Z0-9])*)+';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidEmailAddress': true };
    }
  }

  static curpValidatorOptional(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}' +
      '(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])' +
      '[HM]{1}' +
      '(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|' +
      'MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)' +
      '[B-DF-HJ-NP-TV-Z]{3}' +
      '[0-9A-Z]{1}[0-9]{1}$';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidCurp': true };
    }
  }
  static textoValidator(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '([a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{1,}[ ]{0,}){0,}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidLetras': true };
    }
  }
  static parrafos(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '([\\\/\?\#\\¿\!\_\¡\(\)\"\=\{\}\`\$\+\%\@\*\,\-\.\;\:\s\t\na-zA-ZñÑáéíóúÁÉÍÓÚü0-9][ ]{0,}){0,}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidCaracter': true };
    }
  }
  static telefonoValidator(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '([0-9]{1,4}[\.-]{0,1}){0,4}';
    //let patron: string = '(([\.(][0-9]{1,5}[\.)][0-9]{1,3}(\.-)[0-9]{1,3}(\.-)[0-9]{1,4}[]{0,}){0,}|(([\.(][0-9]{1,3}[\.)][0-9]{1,3}(\.-)[0-9]{1,3}(\.-)[0-9]{1}[]{0,}){0,}))';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidNumeroTelefonico': true };
    }
  }

  static celularValidator(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '([0-9]{1,}[\.-]{0,1}){0,}';
    //let patron: string = '(([\.(][0-9]{1,3}[\.)][0-9]{1,3}(\.-)[0-9]{1,3}(\.-)[0-9]{1,4}[]{0,}){0,}|(([\.(][0-9]{1,3}[\.)][0-9]{1,3}(\.-)[0-9]{1,3}(\.-)[0-9]{1}[]{0,}){0,}))';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidNumeroTelefonico': true };
    }
  }

  static letrasNumerosAcentoPuntoComaValidator(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '([a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\\s\.,\..\.:\.-]{1,}[ ]{0,}){0,}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidLetrasNumerosAcentoPuntoComa': true };
    }
  }
  static letrasNumerosAcentoPuntoComaGatoValidator(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '([a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ#\\s\.,\..\.:\.-]{1,}[ ]{0,}){0,}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidLetrasNumerosAcentoPuntoComaGato': true };
    }
  }

  static numerosFloat(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    //let patron: string = '[0-9]{1}[.]{1}[0-9]{1}'; Se actualiza patron
    let patron: string = '[0-9]{1,3}[.]{1}[0-9]{1,2}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidNumerosFloat': true };
    }
  }

  static cantidadDinero(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    //let patron: string = '[0-9]{1}[.]{1}[0-9]{1}'; Se actualiza patron
    let patron: string = '[0-9]{1,}([.]{1}[0-9]{1,2})?';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidNumerosCantidad': true };
    }
  }

  static anio(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '[0-9]{4}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidAnio': true };
    }
  }

  static hora(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '((1[0-2]|0?[1-9]):([0-5][0-9]) ([AaPp][Mm]))';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidHora': true };
    }
  }

  static rfcValidator(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}' +
      '(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])' +
      '[0-9A-Z]{3}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value)) {
      return null;
    } else {
      return { 'invalidRFC': true };
    }
  }

  static calificacionValidator(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    let patron: string = '[0-9]{1,3}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value) && ((control.value) >= 0 && (control.value) <= 100)) {
      return null;
    } else {
      return { 'invalidCalificacion': true };
    }
  }

  static hoursValidator(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    if ((control.value) > 0 && (control.value) <= 80) {
      return null;
    } else {
      return { 'invalidHours': true };
    }
  }

  static calificacionValidatorRecurso(control): {[key: string]: boolean} {
    if (!control.value) {
      return null;
    }
    if ((control.value) >= 0 && (control.value) <= 80) {
      return null;
    } else {
      return { 'invalidCalificacionRecurso': true };
    }
  }
  static calificacionEvaluacionModB(control): {[key: string]: boolean} {
    // 11/07/2016 Se crea validacion para dos enteros y 3 decimales
    // Esta validacion es usada en las calificaciones de entrevista y ensayo
    // de la evaluación del modulo B
    if (!control.value) {
      return null;
    }

    let patron: string = '[0-9]{1,2}[.]{0,1}[0-9]{0,3}';
    let regex = new RegExp(`^${patron}$`);
    if (regex.test(control.value) && ((control.value) >= 0 && (control.value) <= 10)) {
      return null;
    } else {
      return { 'invalidCalificacionEvaluacion': true };
    }

  }

}
