const data = require("./products_with_images.json");

let insertQuery = "";

for (let el of data) {
  /*
idProduct Primary 	int(11) 			No 	None 		AUTO_INCREMENT 	Change Change 	Drop Drop 	
	2 	idSupplier 	int(11) 			No 	None 			Change Change 	Drop Drop 	
	3 	idCountry 	int(11) 			No 	None 			Change Change 	Drop Drop 	
	4 	idTeam 	int(11) 			No 	None 			Change Change 	Drop Drop 	
	5 	name 	varchar(700) 	utf8_general_ci 		No 	None 			Change Change 	Drop Drop 	
	6 	nameOfCountry 	varchar(500) 	utf8_general_ci 		No 	None 			Change Change 	Drop Drop 	
	7 	nameOfTeam 	varchar(500) 	utf8_general_ci 		No 	None 			Change Change 	Drop Drop 	
	8 	imageUrl 	varchar(700) 	utf8_general_ci 		No 	None 			Change Change 	Drop Drop 	
	9 	price 	float 			No 	None 			Change Change 	Drop Drop 	
	10 	gender 	varchar(500) 	utf8_general_ci 		No 	None 			Change Change 	Drop Drop 	
	11 	championship 	varchar(500) 	utf8_general_ci 		No 	None 			Change Change 	Drop Drop 	
	12 	type 	varchar(500) 	utf8_general_ci 		No 	None 			Change Change 	Drop Drop 	
	13 	years 	varchar(500) 	utf8_general_ci 		No 	None 			Change Change 	Drop Drop 	
	14 	brand 	varchar(500) 	utf8_general_ci 		No 	None 			Change Change 	Drop Drop 	
	15 	available 	tinyint(1) 			No 	1 			Change Change 	Drop Drop 	
	16 	canEditNumber 	tinyint(1) 			No 	None 			Change Change 	Drop Drop 	
	17 	canEditName 	tinyint(11) 			No 	None 			Change Change 	Drop Drop 	
	18 	editPricing 	float 			No 	0 			Change Change 	Drop Drop 	
	19 	timestamp 
  */
  if (el.imageUrl) {
    insertQuery += `INSERT INTO products SET idSupplier = 1, idCountry=${el.brandId}, idTeam=1, name="${el.name}", nameOfCountry="${el.brandName}", nameOfTeam='Team', imageUrl="${el.imageUrl}", price=${el.price}, gender="male", championship="fqsdf", type="parfum", years="3034", brand="${el.brandName}", available=1, canEditNumber=1, canEditName=1, editPricing=0, timestamp=NOW();\n`;
  }
}

console.log(insertQuery);