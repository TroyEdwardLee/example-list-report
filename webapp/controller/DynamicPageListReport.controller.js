sap.ui.define([
	"example/list/reportexample-list-report/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/Label",
	"sap/ui/model/Filter",
	"sap/m/SearchField",
	"sap/ui/model/type/String",
	"sap/m/ColumnListItem",
	"sap/ui/model/FilterOperator"
], function(Controller, JSONModel, Label, Filter, SearchField, typeString, ColumnListItem, FilterOperator) {
	"use strict";

	return Controller.extend("example.list.reportexample-list-report.controller.DynamicPageListReport", {
		onInit: function() {
			this.oModel = new JSONModel();
			this.oModel.loadData(sap.ui.require.toUrl("example/list/reportexample-list-report/mockdata/model.json"), null, false);
			this.getView().setModel(this.oModel, "businessModel");
			this.oColModel = new JSONModel({
				"cols": [
					{
						"label": "Product ID",
						"template": "ProductId",
						"width": "5rem"
					},
					{
						"label": "Product Name",
						"template": "Name"
					},
					{
						"label": "Category",
						"template": "Category"
					}
				]
			});
			this.aKeys = [
				"Name", "Category", "SupplierName"
			];
			this.oSelectName = this.getSelect("slName");
			this.oSelectCategory = this.getSelect("slCategory");
			this.oSelectSupplierName = this.getSelect("slSupplierName");
			this.oModel.setProperty("/Filter/text", "Filtered by None");
			this.addSnappedLabel();

			/*var oFB = this.getView().byId("filterbar");
			if (oFB) {
				oFB.variantsInitialized();
			}*/
		},
		
		onAfterRendering: function() {
			this._oProductMultiInput = this.oView.byId("productMultiInputWithSuggestions");
		},
		
		// dynamic ui table factory function begin
		dynamicTableFactory: function(sId, oContext) {
			var oConsumpColnMetadata = oContext.getObject();
			return this._getColumnControl(oConsumpColnMetadata);
		},
		
		_getColumnControl: function(oMetaData) {
			var oLabel = this._getLabelControl(oMetaData);
			var	oTemplate = this._getSimpleCellTemplate(oMetaData);
			var oConlumn = new sap.ui.table.Column({
				label: oLabel,
				template: oTemplate,
				hAlign: "Begin",
				autoResizable: true,
				showSortMenuEntry: false
			});
			return oConlumn;
		},
		
		_getLabelControl: function(oMetadata) {
			var sText = oMetadata.columnName;
			var	oLabel = new sap.m.Label({
					text: sText,
					tooltip: sText
				});
			return oLabel;
		},
		
		_getSimpleCellTemplate: function(oMetaData) {
			var oText = {};
			if (oMetaData.columnId === "price") {
				oText = new sap.ui.unified.Currency({
					value: "{businessModel>" + oMetaData.columnId + "}",
					currency: "{businessModel>" + oMetaData.unit + "}",
					tooltip: "{=${businessModel>" + oMetaData.columnId + "} ? String(${businessModel>" + oMetaData.columnId + "}) : null}",
					wrapping: false
				});
			} else {
				var oValue = "${businessModel>" + oMetaData.columnId + "}";
				oText = new sap.m.Text({
					text: "{businessModel>" + oMetaData.columnId + "}",
					tooltip: oValue,
					wrapping: false
				});
			}
			return oText;
		},
		// dynamic ui table factory function begin

		onSearch: function(event) {		
			var aFilter = this.getView().byId("smartFilterBar").getFilters();	
			this.getOwnerComponent().getModel().read("/Products", {	
				filters: aFilter,
				success: function(oData) {
					console.log(oData);
				}.bind(this),
				error: function(error) {
					return;
				}.bind(this),
			});	
		},

		/*onSearch: function() {
			var aCurrentFilterValues = [];
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectName));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectCategory));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectSupplierName));
			this.filterTable(aCurrentFilterValues);
		},*/

		onExit: function() {
			this.aKeys = [];
			this.aFilters = [];
			this.oModel = null;
		},
		onToggleHeader: function() {
			this.getPage().setHeaderExpanded(!this.getPage().getHeaderExpanded());
		},
		onToggleFooter: function() {
			this.getPage().setShowFooter(!this.getPage().getShowFooter());
		},
		onSelectChange: function() {
			var aCurrentFilterValues = [];
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectName));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectCategory));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectSupplierName));
			this.filterTable(aCurrentFilterValues);
		},

		filterTable: function(aCurrentFilterValues) {
			this.getTableItems().filter(this.getFilters(aCurrentFilterValues));
			this.updateFilterCriterias(this.getFilterCriteria(aCurrentFilterValues));
		},

		updateFilterCriterias: function(aFilterCriterias) {
			this.removeSnappedLabel(); /* because in case of label with an empty text, */
			this.addSnappedLabel(); /* a space for the snapped content will be allocated and can lead to title misalignment */
			this.oModel.setProperty("/Filter/text", this.getFormattedSummaryText(aFilterCriterias));
		},

		addSnappedLabel: function() {
			var oSnappedLabel = this.getSnappedLabel();
			oSnappedLabel.attachBrowserEvent("click", this.onToggleHeader, this);
			this.getPageTitle().addSnappedContent(oSnappedLabel);
		},

		removeSnappedLabel: function() {
			this.getPageTitle().destroySnappedContent();
		},

		getFilters: function(aCurrentFilterValues) {
			this.aFilters = [];

			this.aFilters = this.aKeys.map(function(sCriteria, i) {
				return new Filter(sCriteria, FilterOperator.Contains, aCurrentFilterValues[i]);
			});

			return this.aFilters;
		},
		getFilterCriteria: function(aCurrentFilterValues) {
			return this.aKeys.filter(function(el, i) {
				if (aCurrentFilterValues[i] !== "") {
					return el;
				}
			});
		},
		getFormattedSummaryText: function(aFilterCriterias) {
			if (aFilterCriterias.length > 0) {
				return "Filtered By (" + aFilterCriterias.length + "): " + aFilterCriterias.join(", ");
			} else {
				return "Filtered by None";
			}
		},

		getTable: function() {
			return this.getView().byId("id-dynamic-table");
		},
		getTableItems: function() {
			return this.getTable().getBinding("rows");
		},
		getSelect: function(sId) {
			return this.getView().byId(sId);
		},
		getSelectedItemText: function(oSelect) {
			return oSelect.getSelectedItem() ? oSelect.getSelectedItem().getKey() : "";
		},
		getPage: function() {
			return this.getView().byId("dynamicPageId");
		},
		getPageTitle: function() {
			return this.getPage().getTitle();
		},
		getSnappedLabel: function() {
			return new Label({
				text: "{/Filter/text}"
			});
		},
		
		// #region Value Help Dialog filters with suggestions
		onValueHelpWithSuggestionsRequested: function() {
			var aCols = this.oColModel.getData().cols;
			this._oBasicSearchFieldWithSuggestions = new SearchField({
				showSearchButton: false
			});

			this._oValueHelpDialogWithSuggestions = sap.ui.xmlfragment("example.list.reportexample-list-report.fragment.ProductValueHelpDialog", this);
			this.getView().addDependent(this._oValueHelpDialogWithSuggestions);

			this._oValueHelpDialogWithSuggestions.setRangeKeyFields([{
				label: "Product",
				key: "ProductId",
				type: "string",
				typeInstance: new typeString({}, {
					maxLength: 10
				})
			}]);

			var oFilterBar = this._oValueHelpDialogWithSuggestions.getFilterBar();
			oFilterBar.setFilterBarExpanded(false);
			oFilterBar.setBasicSearch(this._oBasicSearchFieldWithSuggestions);

			this._oValueHelpDialogWithSuggestions.getTableAsync().then(function (oTable) {
				oTable.setModel(this.oModel);
				oTable.setModel(this.oColModel, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/ProductCollection");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/ProductCollection", function () {
						return new ColumnListItem({
							cells: aCols.map(function (column) {
								return new Label({ text: "{" + column.template + "}" });
							})
						});
					});
				}

				this._oValueHelpDialogWithSuggestions.update();
			}.bind(this));

			this._oValueHelpDialogWithSuggestions.setTokens(this._oProductMultiInput.getTokens());
			this._oValueHelpDialogWithSuggestions.open();
		},
		
		onValueHelpWithSuggestionsOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oProductMultiInput.setTokens(aTokens);
			this._oValueHelpDialogWithSuggestions.close();
		},

		onValueHelpWithSuggestionsCancelPress: function () {
			this._oValueHelpDialogWithSuggestions.close();
		},

		onValueHelpWithSuggestionsAfterClose: function () {
			this._oValueHelpDialogWithSuggestions.destroy();
		},

		onFilterBarWithSuggestionsSearch: function (oEvent) {
			var sSearchQuery = this._oBasicSearchFieldWithSuggestions.getValue(),
				aSelectionSet = oEvent.getParameter("selectionSet");
			var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				if (oControl.getValue()) {
					aResult.push(new Filter({
						path: oControl.getName(),
						operator: FilterOperator.Contains,
						value1: oControl.getValue()
					}));
				}

				return aResult;
			}, []);

			aFilters.push(new Filter({
				filters: [
					new Filter({ path: "ProductId", operator: FilterOperator.Contains, value1: sSearchQuery }),
					new Filter({ path: "Name", operator: FilterOperator.Contains, value1: sSearchQuery }),
					new Filter({ path: "Category", operator: FilterOperator.Contains, value1: sSearchQuery })
				],
				and: false
			}));

			this._filterTableWithSuggestions(new Filter({
				filters: aFilters,
				and: true
			}));
		},

		_filterTableWithSuggestions: function (oFilter) {
			var oValueHelpDialog = this._oValueHelpDialogWithSuggestions;

			oValueHelpDialog.getTableAsync().then(function (oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}

				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}

				oValueHelpDialog.update();
			});
		}
		// #endregion
	});
});