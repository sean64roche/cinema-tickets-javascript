export default class InvalidPurchaseException extends Error {
    constructor(message, accountId, ...ticketTypeRequests) {
        super();
        this.message = `Error while validating ticket purchase: ${message}\n
        Account ID: ${accountId}\n
        Ticket Requests: ${ticketTypeRequests}
        `;
    }
}
