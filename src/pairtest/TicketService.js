import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  constructor(ticketReservationService, seatReservationService) {
    this.#ticketPaymentService = ticketReservationService;
    this.#seatReservationService = seatReservationService;
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    const requests = ticketTypeRequests.map(ticketTypeRequest => ({
      type: ticketTypeRequest.getTicketType(),
      noOfTickets: +ticketTypeRequest.getNoOfTickets(),
      price: this.#calculateTicketPrice(ticketTypeRequest),
    }));

    if (!requests.some(request => {
      return request.type === 'ADULT'
    })) {
      throw new InvalidPurchaseException(`At least one ADULT ticket must be purchased.`, accountId, JSON.stringify(requests));
    }

    const totalTickets = this.#calculateTotalTickets(requests);
    if (totalTickets <= 0 || totalTickets >= 25) {
      throw new InvalidPurchaseException(`${totalTickets} tickets were selected, you may only select 1-25 tickets in a single booking.`, accountId, JSON.stringify(requests));
    }
    const totalSeats = this.#calculateTotalSeats(requests);
    const totalPrice = this.#calculateTotalPrice(requests);

    try {
      this.#seatReservationService.reserveSeat(accountId, totalSeats);
      this.#ticketPaymentService.makePayment(accountId, totalPrice);
    } catch (e) {
      // function(s) to un-reserve seats, reverse payment
      throw new InvalidPurchaseException(`Unknown error encountered during booking.`, accountId, JSON.stringify(requests));
    }

    return {
      accountId,
      totalSeats,
      totalPrice,
    };
  }

  #calculateTicketPrice(ticketTypeRequest) {
    const ticketPrice = (this.#prices)[ticketTypeRequest.getTicketType().toLowerCase()];
    return ticketTypeRequest.getNoOfTickets() * ticketPrice;
  }

  #calculateTotalPrice(requests) {
    let totalPrice = 0;
    for (const request of requests) {
      totalPrice += request.price;
    }
    return totalPrice;
  }

  #calculateTotalSeats(requests) {
    let totalSeats = 0;
    for (const request of requests) {
      if (request.type !== 'INFANT') {
        totalSeats += request.noOfTickets;
      }
    }
    return totalSeats;
  }
  #calculateTotalTickets(requests) {
    let totalTickets = 0;
    for (const request of requests) {
      totalTickets += request.noOfTickets;
    }
    return totalTickets;
  }

  #prices = {
    adult: 25,
    child: 15,
    infant: 0,
  }

  #ticketPaymentService;
  #seatReservationService;
}
