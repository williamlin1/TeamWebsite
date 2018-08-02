    var HTMLtableheader = '<table id = "stocktable" class="table table-hover"> <tr> <th>Rank</th> <th>Symbol</th> <th>Name</th> <th>Investors</th></tr>';

    var HTMLtablerow = '<tr><td>%rank%</td><td><a href=%linksymbol% target="_blank">%symbol%</a></td><td>%name%</td><td>%holder% </a></td></tr>';

    var MENUholder = '<select name="holdermenu" class="holdermenu"></select>';
    var MENUitem = '<option value="%menulink%">%menuitem%</option>';
    var HTMLsearch = '<div id = "searchwindow"><input id="search" placeholder="Search rating by symbol"></div>';
    var HTMLgurus = '<div id = "gurus"> <a href = "/srq"> Ranked Investors </a> </div>';

    var displayTable = function(nRow) {
        $("#content-top").append(HTMLtableheader);
        console.log("JSONtablerows " + JSONtablerows);
        //    var tablerows = jQuery.parseJSON(JSONtablerows);
        var tablerows = JSONtablerows;
        console.log("tablerows " + JSON.stringify(tablerows));
        for (var i = 0; i < nRow; i++) {
            var rowJson = tablerows[i];
            $("#stocktable").append(updateRowStr(rowJson));
        };
    }

    var updateRowStr = function(rowJson) {
        console.log("rowJson " + JSON.stringify(rowJson));
        var symbolLink = '/sq?symbol=' + rowJson.Symbol;
        var rowJsonArray = rowJson.Holder.split(";");
        var myMenuItems = "";
        for (var i = 0; i < rowJsonArray.length; i++) {
            var investorLink = 'q?name=' + encodeURIComponent(rowJsonArray[i]);
            myMenuItems = myMenuItems.concat(MENUitem.replace("%menuitem%", rowJsonArray[i]).replace("%menulink%", investorLink));
        }

        var myMenuHolder = MENUholder.replace("</select>", myMenuItems + '</select>');
        console.log("myMenuHolder " + myMenuHolder);

        var updateStr = HTMLtablerow.replace("%rank%", rowJson.Rank).replace("%symbol%", rowJson.Symbol).replace("%linksymbol%", symbolLink)
            .replace("%name%", rowJson.Company).replace("%holder%", myMenuHolder);
        console.log(updateStr);
        return updateStr;
    }


    var setHolderMenu = function() {
        $(".holdermenu").selectmenu({

            select: function(event, ui) {
                console.log("holdermenu select " + $(this).val());
                if ($(this).val() != '') {

                    window.open($(this).val(), "newtab");
                }
            }
        });
    }

    $(function() {

        $("#headings").append(HTMLsearch);

 //       $("#headings").append(HTMLgurus);

        displayTable(50);

        setHolderMenu();

        var availableTags = JSONtablerows.map(function(item) {
            return item['Symbol'];
        });

        $("#search").autocomplete({
            source: availableTags,
            focus: function(event, ui) {
                // prevent autocomplete from updating the textbox
                event.preventDefault();
            },
            select: function(event, ui) {
                // prevent autocomplete from updating the textbox

                event.preventDefault();
                var result = JSONtablerows.filter(function(obj) {
                    return obj.Symbol == ui.item.value;
                });
                var rowJson = result[0];
                console.log("rowJson " + JSON.stringify(rowJson));
                $('table > tbody > tr:first').after(updateRowStr(rowJson));
 //               $("#stocktable").prepend(updateRowStr(rowJson));
                setHolderMenu();
            }
        });
    });