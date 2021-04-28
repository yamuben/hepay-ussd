import UssdMenu from "ussd-menu-builder";
import axios from "axios";
let menu = new UssdMenu();
let user;
menu.startState({
  run: async () => {
    menu.con(
      "\n1. Ifatabuguzi rya Tv" +
        "\n2. PostPaid Bill" +
        "\n3. Ishyura PSF" +
        "\n4. Ibitaro" +
        "\n5. Rwanda Reveneu"
    );
  },
  next: {
    4: "hpay",
    "*[a-zA-Z]+": "cancel",
  },
});

menu.state("hpay", {
  run: async () => {
    menu.con("Ibitaro:" + "\n1. Kwishyura Service" + "\n2. Kubitsa Kosiyo");
  },
  next: {
    1: "hpay.service",
    2: "hpay.kosiyo",
    "*[a-zA-Z]+": "cancel",
  },
});

menu.state("hpay.service", {
  run: async () => {
    menu.con("Injiza Nimero wivurizaho");
  },
  next: {
    "*[a-zA-Z]+": "hpay.service.userId",
  },
});

menu.state("hpay.kosiyo", {
  run: async () => {
    menu.con("Injiza Nimero wivurizaho");
  },
  next: {
    "*[a-zA-Z]+": "hpay.kosiyo.userId",
  },
});


menu.state("hpay.kosiyo.userId", {
  run: async () => {
    menu.con("Kalisa, ufite 7000 frw, "+"\n Shyiramo amafaranga ubitsa");
  },
  next: {
     "*[1-9]+": "hpay.kosiyo.userId.momo",
  },
});


menu.state("hpay.kosiyo.userId.momo", {
  run: async () => {
    menu.end("Murakoze! \n Emeza kuri MoMo yawe ushyiramo PIN tukubikire:");
  }
});


menu.state("hpay.service.userId", {
  run: async () => {
    // value of patient ID
    const userId = menu.val;

    try {
      const result = await axios({
        method: "POST",
        url: "https://hepaypro.herokuapp.com/api/v1/users/login",
        data: {
          userId,
        },
      });

      const amountToPay = `${result.data.data.amountToPay}`;
      const amountPaidByInsurance = `${result.data.data.amountPaidByInsurance}`;
      const total = Number(amountToPay) + Number(amountPaidByInsurance);
      if (!total)
        menu.end(
          "Nta serivice zihari zo kwishyurwa, Urabanza uhambwe serivice"
        );
      const userName = `${result.data.data.userName.firstName} ${
        result.data.data.userName.middleName
          ? result.data.data.userName.middleName
          : ""
      } ${result.data.data.userName.lastName}`;
      const clientName = `${result.data.data.clientName}`;
      user = result.data.data.userId;
      menu.con(
        "Dear, " +
          userName +
          "\n Pay " +
          clientName +
          "\nInsurance Due amount: " +
          amountPaidByInsurance +
          "Rwf.\n" +
          " Private Due amount: " +
          amountToPay +
          "Rwf.\n" +
          "Total amount " +
          total +
          "Rwf." +
          "\n 1. Kwishyura" +
          "\n 00. Gusohoka"
      );
    } catch (error) {
      if (error.response.data.status === "fail")
        menu.end("Nturi kuri system ya Hepay, Baza kuri reception bagufashe");
      menu.end("Network Error, try again later!");
    }
  },
  next: {
    1: "hpay.private.userId.makePayment",
    "*[a-zA-Z]+": "hpay.private.userId.makePayment.cancel",
  },
});

menu.state("hpay.private.userId.makePayment", {
  run: async () => {
    menu.con("Shyiramo Umubare wibanga wishyure na MoMo");
  },
  next: {
    "*[1-9]+": "hpay.private.userId.makePayment.momocode",
    "*[a-zA-Z]+": "hpay.private.userId.makePayment.cancel",
  },
});

menu.state("hpay.private.userId.makePayment.momocode", {
  run: async () => {
    let returned;
    returned = await axios({
      method: "POST",
      url: "https://hepaypro.herokuapp.com/api/v1/users/pay",
      data: {
        id: user,
      },
    });

    if (returned.data.status === "success") {
      menu.end("Kwishyura byagenze neza, Wakoze gukoresha HePay service");
    }
    menu.end("Kwishyura ntabwo byagenze neza mwongere mukanya");
  },
});
menu.state("cancel", {
  run: async () => {
    menu.end("service cancelled");
  },
});

class hpayController {
  static async hpayLogin(req, res) {
    console.log("helo");
    menu.run(req.body, async (ussdResult) => {
      res.end(ussdResult);
    });
  }
}

export default hpayController;
