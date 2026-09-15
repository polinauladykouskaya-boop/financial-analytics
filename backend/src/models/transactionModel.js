class Transaction {
    constructor(
        id,
        type,
        amount,
        category,
        description,
        date
    ) {
        this.id = id;
        this.type = type;
        this.amount = amount;
        this.category = category;
        this.description = description;
        this.date = date;
    }
}

module.exports = Transaction;