# vai21-projekt-3

# Visualisering av stigande passagerare per hållplats

Datan innehåller medeltal stigande passagerare på en vardag (må-fre) från November 2016. Alla hållplatser i HRTs nätverk är med i datan.

Mängden stigande passagerare baserar sig på automatiska räknare i närtågens dörrar. I metron räknas passagerarna vid passage till plattformen, t.ex. rulltrapporna.

Vi valde att plocka ut metrons och närtågens stationer för att hålla projektet simpelt för att hinna få allt färdigt inom deadline. Dessutom verkade det logiskt att visualisera nätverk baserat på metro och tågnätverket.

Själva datan innehåller ju inte länkar till stationerna, så man hamnade själv skapa dom. Metrons nätverk var simpel, och länkningen kunde skapas inne i själva koden. Det behövdes bara att kolla med en if sats för förgreningen i Östra centrum.

Länkande av tågnätverket skulle ha varit för jobbigt, så bestämde vi att editera originella geojson datan och länka ihop stationerna istället i datan

Vid början av projektet tänkte vi att det räcker med att man visualiserar nätverken med force-directed nätverk, men beslöt att sätta in en toggle för att byta mellan flytande och en karta som baserar sig på stationernas koordinater i riktiga världen

