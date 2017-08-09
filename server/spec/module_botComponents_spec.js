var botComponents = require("../custom_modules/module_botComponents");

describe("Test botComponents functions", function() {
	it("Tests that the getBot() is called", function() {
		spyOn(botComponents, "getBot");
        botComponents.getBot();
        expect(botComponents.getBot).toHaveBeenCalled();
    });
	
	it("Tests that the getConnector() is called", function() {
		spyOn(botComponents, "getConnector");
        botComponents.getConnector();
        expect(botComponents.getConnector).toHaveBeenCalled();
    });
	
	it("Tests that the getBuilder() is called", function() {
		spyOn(botComponents, "getBuilder");
        botComponents.getBuilder();
        expect(botComponents.getBuilder).toHaveBeenCalled();
    });
	
	it("Tests that the getRecognizer() is called", function() {
		spyOn(botComponents, "getRecognizer");
        botComponents.getRecognizer();
        expect(botComponents.getRecognizer).toHaveBeenCalled();
    });
	
	it("Tests that the getDialog() is called", function() {
		spyOn(botComponents, "getDialog");
        botComponents.getDialog();
        expect(botComponents.getDialog).toHaveBeenCalled();
    });

});