// Fonction pour vérifier si une chaîne contient des caractères spéciaux
export function containsSpecialCharacters(str) {
    // Regex pour détecter les caractères spéciaux (sauf les accents)
    const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|<>\/?]/;
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
    const errors = {};
    const validations = {
        titre: validateTitle(taskData.titre),
        description: validateDescription(taskData.description),
        prioriteId: validatePriority(taskData.prioriteId),
        dateLimite: validateDueDate(taskData.dateLimite),
        statutId: validateStatus(taskData.statutId),
        utilisateurId: validateUser(taskData.utilisateurId)
    };

    // Collecter toutes les erreurs
    Object.entries(validations).forEach(([field, validation]) => {
        if (!validation.isValid) {
            errors[field] = validation.message;
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}


// verifier si l'email est valide
export const isEmailValid = (email) => {
    if (!email || typeof email !== "string") {
        return { isValid: false, message: "L'email est requis." };
    }
    if (email.length < 5) {
        return { isValid: false, message: "L'email doit contenir au moins 5 caractères." };
    }
    if (email.length > 50) {
        return { isValid: false, message: "L'email ne peut pas dépasser 50 caractères." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { isValid: false, message: "L'email n'est pas valide." };
    }
    return { isValid: true };
};

// verifier si le password est valide
export const isPasswordValid = (password) => {
    if (!password || typeof password !== "string") {
        return { isValid: false, message: "Le mot de passe est requis." };
    }
    if (password.length < 8) {
        return { isValid: false, message: "Le mot de passe doit contenir au moins 8 caractères." };
    }
    if (password.length > 16) {
        return { isValid: false, message: "Le mot de passe ne peut pas dépasser 16 caractères." };
    }
    return { isValid: true };
};
