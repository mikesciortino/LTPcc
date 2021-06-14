if(typeof Neo !== "undefined") {

    (function($) {

        var category_clicks = $.select("#categories a", "query_all"),
            categories = $.select("table[data-category]", "query_all"),
            add_buttons = $.select(".category[data-category] .button", "query_all"),
            basket_items = $.select("#basket_items"),
            empty = $.select("#empty"),
            proceed = $.select("#proceed"),
            proceed_button = proceed.select(".button");

        if($.isDefined(Storage)) {

            var content = localStorage.getItem("store_basket");

            basket_items.inner(content);

            var items = basket_items.select("basket-item", "class");

            if(items.size() > 0) {

                basket_items.css("display", "block");
                proceed.css("display", "block");
                empty.css("display", "none");

                items.each(function(item) {

                    item.select(".remove").bind("click", function(e) {

                        e.preventDefault();

                        item.remove();

                        var items = basket_items.select("basket-item", "class");

                        if(items.size() <= 0) {
                            basket_items.css("display", "none");
                            proceed.css("display", "none");
                            empty.css("display", "block");
                        }

                        if($.isDefined(Storage)) {
                            localStorage.setItem("store_basket", basket_items.inner());
                        }

                    });

                });


            }

        }

        category_clicks.call("bind", [ "click", function(e) {

            e.preventDefault();

            var tip = e.node.attribute("data-tip");

            categories.call("css", [ "display", "none" ]);
            categories.filter(function(node) {
                return node.attribute("data-category") == tip;
            }).first().css("display", "block");

            category_clicks.call("removeClass", [ "selected" ]);
            e.node.addClass("selected");

        } ]);

        add_buttons.call("bind", [ "click", function(e) {

            e.preventDefault();

            var product = e.node.parent().parent(),
                tip = product.attribute("data-item"),
                image = product.select("img").attribute("src"),
                name = product.select("td:nth-child(2)").inner(),
                price = product.select("td:nth-child(3)").inner(),
                description = product.select("td:nth-child(4)").inner();

            var items = basket_items.select("basket-item", "class");
            var filter = items.filter(function(node) {
                return node.attribute("data-item") == tip;
            }).first();

            if ($.isDefined(filter) && $.isNotNull(filter)) {

                var amount = filter.select(".actual_amount");

                amount.inner((parseInt(amount.inner()) + 1).toString());

            } else {

                var item = $.create("div").addClass("basket-item").attribute("data-item", tip).attribute("title", description),
                    item_image = $.create("div").addClass("item-image"),
                    item_details = $.create("div").addClass("item-details"),
                    actual_image = $.create("img").attribute("src", image).attribute("width", "35"),
                    item_name = $.create("span", {inner: name, class: "name"}),
                    item_price = $.create("span", {inner: price, class: "price"}),
                    amount = $.create("span", {inner: "x ", class: "amount"}),
                    actual_amount = $.create("span", {inner: 1, class: "actual_amount"}),
                    remove = $.create("a", {inner: "Remove", href: "#", class: "remove"}).bind("click", function(e) {

                        e.preventDefault();

                        item.remove();

                        var items = basket_items.select("basket-item", "class");

                        if(items.size() <= 0) {
                            basket_items.css("display", "none");
                            proceed.css("display", "none");
                            empty.css("display", "block");
                        }

                        if($.isDefined(Storage)) {
                            localStorage.setItem("store_basket", basket_items.inner());
                        }

                    });

                basket_items.append(item.append(item_image.append(actual_image))
                    .append(item_details.append(item_name).append(item_price).append(amount.append(actual_amount)).append(remove)).append($.create("div", {class: "clear"})));

                basket_items.css("display", "block");
                proceed.css("display", "block");
                empty.css("display", "none");

                if($.isDefined(Storage)) {
                    localStorage.setItem("store_basket", basket_items.inner());
                }

            }

        } ]);

        function baseUrl() {
            return (window.location.origin+""+window.location.pathname).replace("/index.php", "");
        }

        proceed_button.bind("click", function(e) {

            e.preventDefault();

            if(!$.isDefined(paypal_email)) {
                alert("There is no PayPal email defined in the store.");
                return;
            }

            if(proceed.select("input[name=\"username\"]").value().length <= 0) {
                alert("You must enter a username before proceeding.");
                return;
            }

            var parameters = {
                cmd: "_cart",
                business: paypal_email,
                upload: 1,
                currency_code: "US",
                return: baseUrl(),
                cancel_return: baseUrl(),
                notify_url: baseUrl()+"/notification.php",
                custom: proceed.select("input[name=\"username\"]").value().toLowerCase().replaceAll(" ", "_"),
                no_shipping: 1,
                landing_page: "Login",
                cpp_header_image: window.location.origin+"/home/bin/images/newlogo.png"
            };

            var items = basket_items.select("basket-item", "class"),
                offset = 1;

            items.each(function(item) {

                parameters["item_name_"+offset] = item.select(".name").inner();
                parameters["amount_"+offset] = item.select(".price").inner().replaceAll(" ", "").replace("$", "");
                parameters["quantity_"+offset] = item.select(".actual_amount").inner();
                parameters["item_number_"+offset++] = item.attribute("data-item");

            });

            if($.isDefined(Storage)) {
                localStorage.setItem("store_basket", "");
            }

            $.form("https://www.paypal.com/cgi-bin/webscr/", parameters, "POST");

        });

    })(new Neo({ history: false, prototypes: true }));

}