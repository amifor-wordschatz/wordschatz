const srcFile = process.argv[2];
const targetFile = process.argv[3];

const fs=require('fs');

const makeCards=function(strContent){
	let lines=strContent.split('\r\n');
	let cards=lines.map((l)=>{
		let halves=l.split(' - ');
		if(halves.length!=2){
			console.warn(`Line ${l} can't be splitted!`);
			return null;
		}
		return halves;
	}).filter((c)=>c!=null);
	return cards;
};

const makeTargetLines=function(cards, size)
{
	let obverseLines=[];
	let reversLines=[];
	for(let i=0;i<cards.length;i=i+size){
		let cardLine=cards.slice(i,i+size);
		
		let targetLine1=cardLine.map((c)=>c[0]);		
		while(targetLine1.length<size)
			targetLine1.push('');
		
		obverseLines.push(targetLine1);
		
		targetLine2=cardLine.map((c)=>c[1]);		
		while(targetLine2.length<size)
			targetLine2.splice(0, 0, '');
		reversLines.push(targetLine2);
	}	
	return {
		obverse: obverseLines,
		reverse: reversLines,
		count: obverseLines.length
	};
};

const makeTargetPage=function(targetLines, lineSize, pageSize, cardSeparator){
	while(targetLines.length<pageSize){
		targetLines.push(Array(5).map(x=>''));
	}
	var result=targetLines.map(l=>l.join(cardSeparator));	
	return result;
};

const makeTargetContent=function(targetLines, cardSeparator, lineSize, pageSize){
	var result=[];
	for(let i=0;i<targetLines.count;i+=pageSize){
		var observePage=makeTargetPage(targetLines.obverse.slice(i, i + pageSize), lineSize, pageSize, cardSeparator);
		var reversePage=makeTargetPage(targetLines.reverse.slice(i, i + pageSize), lineSize, pageSize, cardSeparator);
		result=result.concat(observePage).concat(reversePage);
	}
	return result;
}

const writeFile=function(strContent){
	let writePromise=new Promise((resolve,reject)=>{
		return fs.writeFile(targetFile, strContent, 'ucs2', (err)=>{
			if(err)
			{
				console.log(`Can't write ${targetFile}`,err);
				return reject(err);
			}
			resolve();		
		});
	});
	return writePromise;
}

let readPromise=new Promise((resolve, reject) => {
	return fs.readFile(srcFile, 'ucs2', (err,data)=>{
		return err?
			reject(err):
			resolve(data);
	});
});


readPromise.then((strContent)=>{
	let cards=makeCards(strContent);
	let targetLines=makeTargetLines(cards, 5);
	let targetContent=makeTargetContent(targetLines,'\t', 5, 5).join('\r\n');
	writeFile(targetContent).then('success');
});