sap.ui.define([
	"example/list/reportexample-list-report/controller/BaseController",
	"sap/ui/core/routing/History"
], function(BaseController, History) {
	"use strict";

	return BaseController.extend("example.list.reportexample-list-report.controller.NotFound", {

		/**
		 * Navigates to the GongDanChaXun when the link is pressed
		 * @public
		 */
		onLinkPressed: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			}
		}

	});

});