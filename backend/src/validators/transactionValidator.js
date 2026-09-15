const validateTransaction = (data) => {
    const {
        type,
        amount,
        category,
        date
    } = data;

    if (
        !type ||
        amount === undefined ||
        !category ||
        !date
    ) {
        return {
            valid: false,
            message: 'type, amount, category and date are required'
        };
    }

    if (
        type !== 'INCOME' &&
        type !== 'EXPENSE'
    ) {
        return {
            valid: false,
            message: 'type must be INCOME or EXPENSE'
        };
    }

    if (
        typeof amount !== 'number' ||
        amount <= 0
    ) {
        return {
            valid: false,
            message: 'amount must be a positive number'
        };
    }

    return {
        valid: true
    };
};

module.exports = validateTransaction;