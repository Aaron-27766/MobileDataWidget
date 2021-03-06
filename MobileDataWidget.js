// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: battery-three-quarters;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;


// ↓ use different number for cicle length
  var cicleLength = 31
  
  var doMakeRed = false
  

const apiURL = "https://pass.telekom.de/api/service/generic/v1/status";
let fm = FileManager.iCloud();
let p = await args.widgetParameter
let widgetSize = config.widgetFamily

if(p == 'local'){
  fm = FileManager.local();
}

let dir = fm.documentsDirectory();
let path = fm.joinPath(dir, "widget-telekom.json");


let df = new DateFormatter();
df.useShortDateStyle();

let thin_font = Font.regularRoundedSystemFont(10);
let bold_font = Font.heavyRoundedSystemFont(10);

if(widgetSize == "medium"){
  thin_font = Font.regularRoundedSystemFont(17);
  bold_font = Font.heavyRoundedSystemFont(17);
}

let wifi = false;

// HELPER CLASS 
class Telekom{
  constructor(name, usedVolume, usedVolumeNum, initialVolume, remainingVolume, usedPercentage, validUntil, usedAt, restDaysNum, assumption, hours, minutes, expectPercentage, iaD){
   	this.name = name;
    this.usedVolume = usedVolume;
    this.usedVolumeNum = usedVolumeNum;
    this.initialVolume = initialVolume;
    this.remainingVolume = remainingVolume;
    this.usedPercentage = usedPercentage;
    this.validUntil = validUntil;
    this.usedAt = usedAt;
    this.restDaysNum = restDaysNum;
//     this.expectMB = expectMB;
    this.assumption = assumption;
    this.hours = hours;
    this.minutes = minutes;
    this.expectPercentage = expectPercentage;
    this.iaD = iaD
  }
}

// HELPER DARKMODE FUNCTION
async function isUsingDarkAppearance(){
  const wv = new WebView();
  let js = "(window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches)";
  let r = await wv.evaluateJavaScript(js);
  return r;
}

let darkmode = Device.isUsingDarkAppearance();

async function getFromApi(){
    data = '';
    let request = new Request(apiURL);
    request.headers = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1"
    };
  data = await request.loadJSON();
  data.usedAt = Date.now();
  fm.writeString(path, JSON.stringify(data));
    return data;
}

function getFromFile(){
  data = JSON.parse(fm.readString(path));
  return data;
}

async function getData(){ 
  try{
    data_api = await getFromApi();
  }catch{
    wifi = true;
    data_api = await getFromFile();
  }
  
  
  
  
//   date and volume calcs:
  
  var name = data_api.passName;
  var usedVolumeNum = data_api.usedVolume / 1024 / 1024 / 1024;
  var initialVolumeNum = data_api.initialVolume / 1024 / 1024 / 1024;
  
  var usedVolume = String(Math.round((usedVolumeNum + Number.EPSILON) * 100) /100) + ' GB';
  var initialVolume = String(Math.round((initialVolumeNum + Number.EPSILON) * 100) / 100) + ' GB';
  
  var remainingVolumeNum = (data_api.initialVolume - data_api.usedVolume) / 1024 / 1024 / 1024;
  var remainingVolume = String(Math.round((remainingVolumeNum + Number.EPSILON) * 100) / 100) + ' GB';
  var remainingSeconds = data_api.remainingSeconds;
  var usedPercentage = data_api.usedPercentage;
  if (usedPercentage < 100) {
    usedPercentage = Math.round(((data_api.usedVolume / data_api.initialVolume) + Number.EPSILON) * 1000) / 10
    if ((usedPercentage * 10) % 10 == 0) {
      usedPercentage = usedPercentage + ".0"
    }
  }
  
  
  var date = data_api.usedAt + ((data_api.remainingSeconds + 10) * 1000) ;
  
  console.log("date:\n" + date + "\n")

  var validDate = new Date(date);
  var validUntil = df.string(validDate);
  
  console.log("validDate:\n" + validDate + "\n")
  
  var from = date - (cicleLength * 86400000);
  var fromDate = new Date(from);
  var validFromDate = df.string(fromDate);
  
  var diff = data_api.usedAt - from;
  var diffDays = diff / 86400000;
  
  
  console.log("diffDays:\n" + diffDays + "\n")
  
  var diffDaysValid = diffDays + 1 - (diffDays % 1)
  
  console.log("diffDaysValid:\n" + diffDaysValid + "\n")
  
//   expectMB:
  
//   var expectMB = diffDays * initialVolumeNum * 1000 / cicleLength;
//   
//   console.log("iVN: " + initialVolumeNum)
//   console.log("eMB: " + expectMB)
  
  
  
  
//   expectPercentage:
  
  var expectPercentage = 100 * (diffDaysValid / cicleLength)
  if (expectPercentage < 0) {
    expectPercentage = -(expectPercentage)
  }
  console.log("expectPercentage:\n" + expectPercentage + "\n")
  
  
//   restDays & iaD:
 
  var restHours = remainingSeconds / 60 / 60
  console.log("restDaysInHours:\n" + restHours + "\n")
  var restDays = restHours / 24
  console.log("restDays:\n" + restDays + "\n")
  restHours = restHours % 24
  console.log("restHours:\n" + restHours + "\n")
  
  var restDaysNum = restDays - (restDays % 1)
  var restHoursNum = restHours - (restHours % 1)
    console.log("restHoursNum: " + restHoursNum + "\n")
  
    var todayS = Date.now()
    var tomorrowS = todayS + 86400000;
    var tomorrowC = new Date(tomorrowS);
    tomorrowS = df.date(df.string(tomorrowC));
    var hours = (tomorrowS - todayS) / 3600000
  
    var minutes = hours % 1
    
    hours = hours - (minutes)
    console.log("hours: " + hours + "\n")
    
    minutes = minutes * 60
    
    var seconds = minutes % 1
    
    minutes = minutes - (seconds)
    console.log("minutes: " + minutes + "\n")
    
  
  var iaD = false
if (doMakeRed == true) {
  if (hours > restHoursNum) {
    if (restDaysNum > 0) {
      restDaysNum = (restDaysNum - 1)
      iaD = true
    }
  }
}
  console.log("iaD: " + String(iaD) + "\n")
  
  
  
//   assumption:
  
  var usedAt = data_api.usedAt
  
  var assumptionNum = ((usedVolumeNum / diffDays) * cicleLength);
  assumptionNum = assumptionNum + 0.01
  console.log("assumptionNum: " + assumptionNum + "\n")
  var assumption = String(Math.round((assumptionNum + Number.EPSILON) * 100) / 100);

  console.log("aN:\n" + assumptionNum + "\n")
  console.log("assumption: " + assumption + "\n")
  console.log("usedVolumeNum:\n" + usedVolumeNum + "\n")
  console.log("diffDays:\n" + diffDays + "\n")
  
  
//   all:
  
  var telekom = new Telekom(name, usedVolume, usedVolumeNum, initialVolume, remainingVolume, usedPercentage, validUntil, usedAt, restDaysNum, assumption, hours, minutes, expectPercentage, iaD);
  
  return telekom;
}







async function createWidget(data){
  
//   start:

  var widget = new ListWidget();
  
//   widget.backgroundImage = FileManager.local().readImage(backgroundPath)

//   
//   widget.url = "https://datapass.de/";
//   
  
  widget.addSpacer(5)
  
  
  
//   header:
  
  var header_stack = widget.addStack();
  var symbol = SFSymbol.named('antenna.radiowaves.left.and.right').image;
  if (wifi){
    symbol = SFSymbol.named('wifi').image;
  }
  var symbol_image = header_stack.addImage(symbol);
    symbol_image.imageSize = new Size(15, 15);
  symbol_image.tintColor = Color.purple()
  header_stack.addSpacer(3);
  var title = header_stack.addText("MOBILE DATA");
  title.font = Font.boldRoundedSystemFont(13)
  title.textColor = Color.purple()
  console.log("title:\n" + title.text + "\n")
  
//   line:

  var line = widget.addText("———————————————————")
  line.font = Font.blackRoundedSystemFont(5)
  line.textColor = Color.purple()
  console.log("line:\n" + line.text + "\n")




//    line2:

  var usedP = data.usedPercentage
  
  var expectPercentage = Math.round(data.expectPercentage + Number.EPSILON);
  var bottomBorder = expectPercentage - 5
  
  let percentageStack = widget.addStack()
  percentageStack.layoutHorizontally()
  
  var line2 = percentageStack.addText(String(usedP))

    line2.font = Font.boldRoundedSystemFont(40)
    line2.textColor = Color.green()
    
    percentageStack.addSpacer(0)
    
    let percentStack = percentageStack.addStack()
    percentStack.layoutVertically()
    
    percentStack.addSpacer(11)
    
    var percent = percentStack.addText("%")
    percent.font = Font.boldRoundedSystemFont(28)
    percent.textColor = Color.green()
    
    var sc_status = "No"
    
    if (usedP >= expectPercentage) {
      line2.textColor = Color.red()
      percent.textColor = Color.red()
      
      sc_status = "Yes"
    }
    if ((usedP > bottomBorder) && (usedP <= expectPercentage)) {
      line2.textColor = Color.orange()
      percent.textColor = Color.orange()
      
      sc_status = "Yes"
    }
    if (usedP >= 95) {
      line2.textColor = Color.orange()
      percent.textColor = Color.orange()
      
      sc_status = "Yes"
    }
    if (usedP >= 100) {
      line2.textColor = Color.red()
      percent.textColor = Color.red()
      
      sc_status = "Yes"
    }
    console.log("line2:\n" + line2.text + "\n")
    
    let sc_fm = FileManager.iCloud()  
    if (sc_fm.bookmarkExists("Shortcuts/Memory")) {
      let sc_dir = sc_fm.bookmarkedPath("Shortcuts/Memory")    
      let sc_path = sc_fm.joinPath(sc_dir, "DataUsed.txt")
      sc_fm.writeString(sc_path, sc_status)  
    }

    
//     line3:
  
    var usedV = data.usedVolume
    if (Number(String(data.initialVolume).replace(" GB", "")) >= 10) {
      usedV = String((Math.round((Number(String(usedV).replace(" GB", "")) + Number.EPSILON) * 10) / 10) + " GB")
    }
  log("usedV: " + usedV + "\n")
  
    var line3 = widget.addText(usedV + " / " + data.initialVolume)
    line3.font = Font.boldRoundedSystemFont(16)
    line3.textColor = Color.purple()
    console.log("line3:\n" + line3.text + "\n")
    
    
    
//     line4:
    
    var assumption = data.assumption
  var checkAssumptionNum = Number(assumption.replace(".",""));
  var checkAssumptionStr = String(checkAssumptionNum);
  
  if (assumption >= 1) {
    if (assumption == checkAssumptionStr) {
      if (checkAssumptionNum < 10) {
        assumption = (assumption + ".00")
      }else if (checkAssumptionNum < 100) {
        assumption = (assumption + ".0")
      }
    
    }else if (checkAssumptionNum < 10) {
      assumption = (assumption + ".00")
      
    }else if (checkAssumptionNum < 100) {
      assumption = (assumption + "0")
    }
  }else {
    if ((checkAssumptionNum < 10) && (assumption % 0.1 == 0)) {
        assumption = (assumption + "0")
    }
  }
  
  
  console.log("assumption:\n" + assumption + "\n")
  console.log("checkAssumptionNum:\n" + checkAssumptionNum + "\n")
    
  var line4 = widget.addStack()
  var line4textLeft = line4.addText("Estimation:");          
  line4textLeft.font = Font.mediumRoundedSystemFont(10)
  console.log("line4textLeft:\n" + line4textLeft.text + "\n")    
  line4.addSpacer()
  var line4textRight = line4.addText(assumption + " GB ");          
  line4textRight.font = Font.mediumRoundedSystemFont(10)
  console.log("line4textRight:\n" + line4textRight.text + "\n")
  
//   line5:  
  var line5 = widget.addStack()  
  var line5textLeft = line5.addText("Expected %age:");            
  line5textLeft.font = Font.mediumRoundedSystemFont(10)
  console.log("line5textLeft:\n" + line5textLeft.text + "\n")  
  line5.addSpacer()
  var line5textRight = line5.addText(expectPercentage + "% ");            
  line5textRight.font = Font.mediumRoundedSystemFont(10)
  console.log("line5textRight:\n" + line5textRight.text + "\n")
  
  
  
//   line6:

  var symbol = " → "
  
  var untilDate = String(data.validUntil).replace(".21", "")
  
  var restDays = (data.restDaysNum + " Ds");
//   if (data.restDaysNum < 10) {
//     if (data.restDaysNum != 0) {
//       
//       restDays = (data.restDaysNum + "'" + data.hours + " Ds");
//     
//       if (data.hours >= 10) {
//         symbol = "|"
//       }else {
//         symbol = " | "
//       }
//       
//     }else {
//       
//       symbol = "|"
//       
//       var hrs = data.hours
//       var mins = data.minutes
//       
//       if (hrs < 10) {
//         hrs = String("0" + hrs)
//       }
//       if (mins < 10) {
//         mins = String("0" + mins)
//       }
//       
//       restDays = (hrs + "\"" + mins + " h");
// 
//     }
//   }

  
  var line6 = widget.addStack()
  var line6textLeft = line6.addText("Validity:");
  line6textLeft.font = Font.mediumRoundedSystemFont(10)    
  line6.addSpacer()
  var line6textRight = line6.addText(restDays + symbol + untilDate + '.');
  line6textRight.font = Font.mediumRoundedSystemFont(10)


  if (data.iaD == true) {
    line6textLeft.textColor = Color.red()
    line6textRight.textColor = Color.red()
  }
  console.log("line6textLeft:\n" + line6textLeft.text + "\n")
  console.log("line6textRight:\n" + line6textRight.text + "\n")
  
  
  
//   end:
  
  widget.addSpacer(5)
  
//   var now = new Date();
//   var timeLabel = widget.addDate(now);
//   timeLabel.font = Font.boldRoundedSystemFont(10);
//   timeLabel.centerAlignText();
//   timeLabel.applyTimeStyle();
//   timeLabel.textColor = Color.darkGray();
  
  
  return widget;
}

var widget = new ListWidget();
var info = widget.addText('Schalte zur ersten Einrichtung das WLAN aus und starte das Script erneut.');
info.font = Font.systemFont(13);

try {
  var data = await getData();
  var widget = await createWidget(data);
  
  widget.refreshAfterDate = new Date(Date.now() + 100);
}catch {
  console.log('First init not working or error while fetching data');
}

Script.setWidget(widget);
// widget.presentSmall();
Script.complete();