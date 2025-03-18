// Fonction pour vérifier si une chaîne contient des caractères spéciaux
export function containsSpecialCharacters(str) {
    // Regex pour détecter les caractères spéciaux (sauf les accents)
    const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return specialCharsRegex.test(str);
}

// Validation du titre
export function validateTitle(title) {
    if (!title || title.trim().length === 0) {
        return { isValid: false, message: "Le titre ne peut pas être vide" };
    }
    if (title.length < 5) {
        return { isValid: false, message: "Le titre doit contenir au moins 5 caractères" };
    }
    if (title.length > 15) {
        return { isValid: false, message: "Le titre ne peut pas dépasser 15 caractères" };
    }
    if (containsSpecialCharacters(title)) {
        return { isValid: false, message: "Le titre ne peut pas contenir de caractères spéciaux" };
    }
    return { isValid: true };
}

// Validation de la description
export function validateDescription(description) {
    if (!description || description.trim().length === 0) {
        return { isValid: false, message: "La description ne peut pas être vide" };
    }
    if (description.length < 5) {
        return { isValid: false, message: "La description doit contenir au moins 5 caractères" };
    }
    if (description.length > 1000) {
        return { isValid: false, message: "La description ne peut pas dépasser 1000 caractères" };
    }
    if (containsSpecialCharacters(description)) {
        return { isValid: false, message: "La description ne peut pas contenir de caractères spéciaux" };
    }
    return { isValid: true };
}

// Validation de la priorité
export function validatePriority(priority) {
    if (!priority || isNaN(parseInt(priority))) {
        return { isValid: false, message: "La priorité est invalide" };
    }
    const priorityId = parseInt(priority);
    if (priorityId < 1 || priorityId > 3) {
        return { isValid: false, message: "La priorité doit être comprise entre 1 et 3" };
    }
    return { isValid: true };
}

// Validation de la date limite
export function validateDueDate(dueDate) {
    if (!dueDate) {
        return { isValid: false, message: "La date limite est obligatoire" };
    }
    const selectedDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
        return { isValid: false, message: "La date limite n'est pas valide" };
    }
    if (selectedDate < today) {
        return { isValid: false, message: "La date limite ne peut pas être dans le passé" };
    }
    return { isValid: true };
}

// Validation du statut
export function validateStatus(status) {
    if (!status || isNaN(parseInt(status))) {
        return { isValid: false, message: "Le statut est invalide" };
    } 
    const statusId = parseInt(status);
    if (statusId < 1 || statusId > 4) {
        return { isValid: false, message: "Le statut doit être compris entre 1 et 4" };
    }
    return { isValid: true }; 
}

// Validation de l'utilisateur
export function validateUser(userId) {
    if (!userId || isNaN(parseInt(userId))) {
        return { isValid: false, message: "L'utilisateur est invalide" };
    }
    return { isValid: true };
}

// Validation complète des données d'une tâche
export function validateTaskData(taskData) {
    const errors = [];

    // Validation du titre
    const titleValidation = validateTitle(taskData.titre);
    if (!titleValidation.isValid) {
        errors.push(titleValidation.message);
    }

    // Validation de la description
    const descriptionValidation = validateDescription(taskData.description);
    if (!descriptionValidation.isValid) {
        errors.push(descriptionValidation.message); 
    }

    // Validation de la priorité
    const priorityValidation = validatePriority(taskData.prioriteId);
    if (!priorityValidation.isValid) {
        errors.push(priorityValidation.message);
    }

    // Validation de la date limite
    const dueDateValidation = validateDueDate(taskData.dateLimite);
    if (!dueDateValidation.isValid) {
        errors.push(dueDateValidation.message);
    }

    // Validation du statut
    const statusValidation = validateStatus(taskData.statutId);
    if (!statusValidation.isValid) {
        errors.push(statusValidation.message);
    }

    // Validation de l'utilisateur
    const userValidation = validateUser(taskData.utilisateurId);
    if (!userValidation.isValid) {
        errors.push(userValidation.message);
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}
