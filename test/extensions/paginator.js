/*
  backgrid
  http://github.com/wyuenho/backgrid

  Copyright (c) 2013 Jimmy Yuen Ho Wong and contributors
  Licensed under the MIT @license.
*/
describe("A Paginator", function () {

  var collection, paginator;

  describe("when under client mode", function () {

    beforeEach(function () {
      collection = new Backbone.PageableCollection([{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}], {
        state: {
          pageSize: 2
        },
        mode: "client"
      });

      paginator = new Backgrid.Extension.Paginator({
        collection: collection,
        columns: [{name: "id", cell: "integer"}]
      });

      paginator.render();
    });

    it("#calculateWindow should return the correct start and end bound", function () {
      var window = paginator._calculateWindow();
      expect(window[0]).toBe(0);
      expect(window[1]).toBe(3);

      collection.fullCollection.pop();
      var window = paginator._calculateWindow();
      expect(window[0]).toBe(0);
      expect(window[1]).toBe(2);

      collection.fullCollection.pop();
      var window = paginator._calculateWindow();
      expect(window[0]).toBe(0);
      expect(window[1]).toBe(2);

      collection.fullCollection.shift();
      var window = paginator._calculateWindow();
      expect(window[0]).toBe(0);
      expect(window[1]).toBe(1);

      collection.fullCollection.reset();
      var window = paginator._calculateWindow();
      expect(window[0]).toBe(0);
      expect(window[1]).toBe(1);
    });

    it("renders 1 handle when the collection has <= 1 page", function () {
      paginator = new Backgrid.Extension.Paginator({
        collection: new Backbone.PageableCollection([], {
          state: {
            pageSize: 2
          },
          mode: "client"
        }),
        columns: [{name: "id", cell: "integer"}]
      });

      paginator.render();

      expect(paginator.$el.find("a").length).toBe(5);
      expect(paginator.$el.find("a[title='Page 1']").length).toBe(1);
      expect(paginator.$el.find("a[title='Page 2']").length).toBe(0);

      paginator = new Backgrid.Extension.Paginator({
        collection: new Backbone.PageableCollection([{id: 1}], {
          state: {
            pageSize: 2
          },
          mode: "client"
        }),
        columns: [{name: "id", cell: "integer"}]
      });

      paginator.render();

      expect(paginator.$el.find("a").length).toBe(5);
      expect(paginator.$el.find("a[title='Page 1']").length).toBe(1);
      expect(paginator.$el.find("a[title='Page 2']").length).toBe(0);

      paginator = new Backgrid.Extension.Paginator({
        collection: new Backbone.PageableCollection([{id: 1}, {id: 2}], {
          state: {
            pageSize: 2
          },
          mode: "client"
        }),
        columns: [{name: "id", cell: "integer"}]
      });

      paginator.render();

      expect(paginator.$el.find("a").length).toBe(5);
      expect(paginator.$el.find("a[title='Page 1']").length).toBe(1);
      expect(paginator.$el.find("a[title='Page 2']").length).toBe(0);
    });

    it("clicking on active or disabled page handles have no effect", function () {
      paginator = new Backgrid.Extension.Paginator({
        collection: new Backbone.PageableCollection([{id: 1}], {
          state: {
            pageSize: 1
          },
          mode: "client"
        }),
        columns: [{name: "id", cell: "integer"}]
      });

      paginator.$el.find("a").eq(0).click();
      expect(paginator.collection.state.currentPage).toBe(1);

      paginator.$el.find("a").eq(1).click();
      expect(paginator.collection.state.currentPage).toBe(1);

      paginator.$el.find("a").eq(2).click();
      expect(paginator.collection.state.currentPage).toBe(1);

      paginator.$el.find("a").eq(3).click();
      expect(paginator.collection.state.currentPage).toBe(1);

      paginator.$el.find("a").eq(4).click();
      expect(paginator.collection.state.currentPage).toBe(1);
    });

    it("has page handles that go to the correct pages when clicked", function () {
      // page 2
      paginator.$el.find("a").eq(3).click();
      expect(collection.state.currentPage).toBe(2);

      // page 1
      paginator.$el.find("a").eq(2).click();
      expect(collection.state.currentPage).toBe(1);

      // reset window size and rerender
      paginator.windowSize = 1;
      paginator.render();

      // last page
      paginator.$el.find("a").eq(4).click();
      expect(paginator.$el.find("a").eq(2).html()).toBe('3');
      expect(collection.state.currentPage).toBe(3);

      // prev page
      paginator.$el.find("a").eq(1).click();
      expect(paginator.$el.find("a").eq(2).html()).toBe('2');
      expect(collection.state.currentPage).toBe(2);

      // 0-based page indices
      collection = new Backbone.PageableCollection([{id: 1}, {id: 2}, {id: 3}], {
        mode: "client",
        state: {
          pageSize: 1,
          firstPage: 0
        }
      });
      paginator = new Backgrid.Extension.Paginator({
        collection: collection,
        columns: [{name: "id", cell: "integer"}]
      });
      paginator.render();

      // next page
      paginator.$el.find("a").eq(3).click();
      expect(collection.state.currentPage).toBe(1);

      // first page
      paginator.$el.find("a").eq(0).click();
      expect(collection.state.currentPage).toBe(0);
    });

    it("renders page handles <= windowSize", function () {
      expect(paginator.$el.find("a").length).toBe(7);

      paginator.windowSize = 1;
      paginator.render();

      expect(paginator.$el.find("a").length).toBe(5);
    });

    it("refreshes upon row insertion", function () {
      collection.add([{id: 6}, {id: 7}]);
      expect(paginator.$el.find("a").length).toBe(8);
      expect(paginator.$el.find("a[title='Page 4']").length).toBe(1);
    });

    it("refreshes upon row removal", function () {
      collection.remove(collection.first());
      expect(paginator.$el.find("a").length).toBe(6);
      expect(paginator.$el.find("a[title='Page 3']").length).toBe(0);
    });

    it("refreshes upon collection reset", function () {
      collection.fullCollection.reset();
      expect(paginator.$el.find("a").length).toBe(5);
      expect(paginator.$el.find("a[title='Page 1']").length).toBe(1);
      expect(paginator.$el.find("a[title='Page 2']").length).toBe(0);
    });

    it("will go back to the first page on sort", function () {
      paginator.$el.find("a").eq(3).click();
      collection.setSorting("id", -1);
      collection.fullCollection.sort();
      expect(paginator.$el.find("li").eq(2).hasClass("active")).toBe(true);
    });
  });

  describe("when under server mode", function () {

    beforeEach(function () {
      collection = new Backbone.PageableCollection([{id: 1}], {
        state: {
          pageSize: 1,
          totalRecords: 3
        }
      });

      paginator = new Backgrid.Extension.Paginator({
        collection: collection,
        columns: [{name: "id", cell: "integer"}]
      });

      paginator.render();
    });

    it("clicking on active or disabled page handles have no effect", function () {
      paginator = new Backgrid.Extension.Paginator({
        collection: new Backbone.PageableCollection([{id: 1}], {
          state: {
            pageSize: 1
          }
        }),
        columns: [{name: "id", cell: "integer"}]
      });

      paginator.$el.find("a").eq(0).click();
      expect(paginator.collection.state.currentPage).toBe(1);

      paginator.$el.find("a").eq(1).click();
      expect(paginator.collection.state.currentPage).toBe(1);

      paginator.$el.find("a").eq(2).click();
      expect(paginator.collection.state.currentPage).toBe(1);

      paginator.$el.find("a").eq(3).click();
      expect(paginator.collection.state.currentPage).toBe(1);

      paginator.$el.find("a").eq(4).click();
      expect(paginator.collection.state.currentPage).toBe(1);
    });

    it("has page handles that go to the correct pages when clicked", function () {
      paginator.windowSize = 1;
      paginator.render();

      collection.url = "url";

      var oldAjax = Backbone.ajax;

      // last page
      Backbone.ajax = function (settings) {
        settings.success([{id: 3}]);
      };
      paginator.$el.find("a").eq(4).click();
      expect(paginator.$el.find("a").eq(2).html()).toBe('3');
      expect(collection.state.currentPage).toBe(3);

      // prev page
      Backbone.ajax = function (settings) {
        settings.success([{id: 2}]);
      };
      paginator.$el.find("a").eq(1).click();
      expect(paginator.$el.find("a").eq(2).html()).toBe('2');
      expect(collection.state.currentPage).toBe(2);

      // 0-based page indices
      collection = new Backbone.PageableCollection([{id: 1}, {id: 2}], {
        state: {
          pageSize: 2,
          totalRecords: 5,
          firstPage: 0
        }
      });

      collection.url = "url";

      paginator = new Backgrid.Extension.Paginator({
        collection: collection,
        columns: [{name: "id", cell: "integer"}]
      });

      paginator.render();

      // page 2
      Backbone.ajax = function (settings) {
        settings.success([{id: 3}, {id: 4}]);
      };
      paginator.$el.find("a").eq(3).click();
      expect(collection.state.currentPage).toBe(1);

      // page 1
      Backbone.ajax = function (settings) {
        settings.success([{id: 1}, {id: 2}]);
      };
      paginator.$el.find("a").eq(2).click();
      expect(collection.state.currentPage).toBe(0);

      // next page
      Backbone.ajax = function (settings) {
        settings.success([{id: 3}, {id: 4}]);
      };
      paginator.$el.find("a").eq(5).click();
      expect(collection.state.currentPage).toBe(1);

      // first page
      Backbone.ajax = function (settings) {
        settings.success([{id: 1}, {id: 2}]);
      };
      paginator.$el.find("a").eq(0).click();
      expect(collection.state.currentPage).toBe(0);

      Backbone.ajax = oldAjax;
    });

    it("renders page handles <= windowSize", function () {
      expect(paginator.$el.find("a").length).toBe(7);

      paginator.windowSize = 1;
      paginator.render();

      expect(paginator.$el.find("a").length).toBe(5);
    });

    it("displays a single page handler number 1 when the collection is empty and totalRecords is null", function () {
      paginator = new Backgrid.Extension.Paginator({
        collection: new Backbone.PageableCollection(),
        columns: [{name: "id", cell: "integer"}]
      });

      paginator.render();

      expect(paginator.$el.find("a").length).toBe(5);
      expect(paginator.$el.find("a[title='Page 1']").length).toBe(1);
      expect(paginator.$el.find("a[title='Page 2']").length).toBe(0);
    });

    it("refreshes upon collection reset", function () {
      collection.reset([{id: 1}]);
      expect(paginator.$el.find("a").length).toBe(7);
      expect(paginator.$el.find("a[title='Page 1']").length).toBe(1);
      expect(paginator.$el.find("a[title='Page 2']").length).toBe(1);
      expect(paginator.$el.find("a[title='Page 3']").length).toBe(1);
    });

  });

  describe("renders only the control page handles declared", function () {

    beforeEach(function () {
      collection = new Backbone.PageableCollection([{id: 1}, {id: 2}, {id: 3}], {
        state: {
          pageSize: 1
        },
        mode: "client"
      });

      paginator = new Backgrid.Extension.Paginator({
        collection: collection,
        columns: [{name: "id", cell: "integer"}]
      });

      paginator.render();
    });

    it("defined under any mode", function () {
      paginator = new (Backgrid.Extension.Paginator.extend({
        controls: {
          back: {
            label: "prev",
            title: "prev"
          },
          forward: {
            label: "next",
            title: "next"
          }
        }
      }))({
        collection: collection,
        columns: [{name: "id", cell: "integer"}]
      });
      paginator.render();
      expect(paginator.$el.find("a").length).toBe(5);
      expect(paginator.$el.find("a").eq(0).html()).toBe("prev");
      expect(paginator.$el.find("a").eq(4).html()).toBe("next");
    });
  });

});
