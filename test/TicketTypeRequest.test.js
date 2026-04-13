import * as test from 'node:test';
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest.js";
import * as assert from "node:assert";
import TicketService from "../src/pairtest/TicketService.js";
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';

let ticketService;
const testPaymentService = {
    makePayment: (accountId, totalSeats) => { return { accountId, totalSeats }; },
};
const testReservationService = {
    reserveSeat: (accountId, totalPrice) => { return { accountId, totalPrice }; },
};

test.before(async () => {
    ticketService = new TicketService(testPaymentService, testReservationService);
});

test.describe("2 plus 2", function() {
    test.it("is 4", function() {
        assert.strictEqual(4, 2 + 2);
    });
});

test.describe("One adult ticket", function() {
    const request = new TicketTypeRequest('ADULT', 1);
    test.it("books successfully", function() {
        ticketService.purchaseTickets(1, request);
    });
});

test.describe("One adult ticket, one child ticket, one infant ticket", function() {
    const request = new TicketTypeRequest('ADULT', 1);
    const request2 = new TicketTypeRequest('CHILD', 1);
    const request3 = new TicketTypeRequest('INFANT', 1);
    let bookingObj;
    test.it("books successfully", function() {
        bookingObj = ticketService.purchaseTickets(1, request, request2, request3);
    });
    test.it("calculates payment of 40 (GBP)", function() {
        assert.strictEqual(bookingObj.totalPrice, 40);
    });
    test.it("has three minus one seats", function() {
        assert.strictEqual(bookingObj.totalSeats, 3 - 1);
    });
});

test.describe("three adult, two child, two infant", function() {
    const request = new TicketTypeRequest('ADULT', 3);
    const request2 = new TicketTypeRequest('CHILD', 2);
    const request3 = new TicketTypeRequest('INFANT', 2);
    let bookingObj;
    test.it("books successfully", function() {
        bookingObj = ticketService.purchaseTickets(1, request, request2, request3);
    });
    test.it("calculates payment of 105 (GBP)", function() {
        assert.strictEqual(bookingObj.totalPrice, 105);
    });
    test.it("has seven minus two seats", function() {
        assert.strictEqual(bookingObj.totalSeats, 7 - 2);
    });
});

test.describe("twenty adult, ten infant", function() {
    const request = new TicketTypeRequest('ADULT', 20);
    const request2 = new TicketTypeRequest('INFANT', 10);
    let bookingObj;
    test.it("prevents booking", function() {
        assert.throws(() => ticketService.purchaseTickets(1, request, request2), InvalidPurchaseException);
    });
});

test.describe("No adult ticket, one child ticket", function() {
    const request = new TicketTypeRequest('CHILD', 1);
    test.it("prevents booking", function() {
        assert.throws(() => ticketService.purchaseTickets(1, request), InvalidPurchaseException);
    });
});

test.describe("No adult ticket, three infant ticket", function() {
    const request = new TicketTypeRequest('INFANT', 3);
    test.it("prevents booking", function() {
        assert.throws(() => ticketService.purchaseTickets(1, request), InvalidPurchaseException);
    });
});