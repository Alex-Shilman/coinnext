(function() {
  var JsonRenderer, Payment, Wallet;

  Payment = require("../models/payment");

  Wallet = require("../models/wallet");

  JsonRenderer = require("../lib/json_renderer");

  module.exports = function(app) {
    return app.post("/payments", function(req, res) {
      var address, amount, walletId;
      amount = req.body.amount;
      walletId = req.body.wallet_id;
      address = req.body.address;
      if (req.user) {
        return Wallet.findUserWallet(req.user.id, walletId, function(err, wallet) {
          var payment;
          if (wallet) {
            if (wallet.canWithdraw(amount)) {
              payment = new Payment({
                user_id: req.user.id,
                wallet_id: walletId,
                amount: amount,
                address: address
              });
              return payment.save(function(err, pm) {
                if (err) {
                  return JsonRenderer.error("Sorry, could not schedule a payment...", res);
                }
                return res.json(JsonRenderer.payment(pm));
              });
            } else {
              return JsonRenderer.error("You don't have enough funds.", res);
            }
          } else {
            return JsonRenderer.error("Wrong wallet.", res);
          }
        });
      } else {
        return JsonRenderer.error("Please auth.", res);
      }
    });
  };

}).call(this);
