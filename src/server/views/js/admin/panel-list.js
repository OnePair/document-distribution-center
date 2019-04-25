function createListItem(listGroupId, title, key, value) {

  var titleId = "dropdown-" + title.replace(/ /g, "-");
  var detailId = "detail-" + title.replace(/ /g, "-");

  var listHtml = `<li class="list-group-item">
    <div class="row toggle" id="${titleId}" data-toggle="${detailId}">
      <div class="col-xs-10">
        ${title}
      </div>
      <!--<div class="col-xs-2"><i class="fa fa-chevron-down pull-right"></i></div>-->
    </div>
    <div id="${detailId}">
      <hr></hr>
      <div class="container">
        <div class="fluid-row">
          <div class="col-xs-1">
            ${key}:
          </div>
          <div class="col-xs-5">
            ${value}
          </div>
        </div>
      </div>
    </div>
  </li>`;

  var listItem = $(listHtml);
  $("[id^=detail-]").hide();
  $(listGroupId).append(listItem);
}

function setupPanelList() {
  $("[id^=detail-]").hide();
  //$(".toggle").unbind();
  $(".toggle").click(function() {
    $input = $(this);
    $target = $("#" + $input.attr("data-toggle"));
    $target.slideToggle();
  });
}
