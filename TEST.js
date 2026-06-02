let input;
let inputTemp;
let	data;
let	index;
let	skipCounter;

/**
 * 
 * @param {{}} data 
 * @param {string} field 
 * @param {{counter: number, end: boolean}} skip
 * @returns {string | undefined}
 */
function resolveField(data, field, skip={counter: 0, end: false})
{
	let	index;
	let	currKey;
	let	input;
	let	foundField;

	input = field;
	index = input.indexOf(".");
	skip.end = true;
	while (input.length != 0)
	{
		if (Array.isArray(data) && input)
		{
			foundField = undefined;
			for (const val of data)
			{
				foundField = resolveField(val, input, skip);
				skip.end = false;
				if (foundField != undefined)
				{
					if (skip.counter == 0)
						break ;
					foundField = undefined;
					skip.counter -= 1;
				}
			}
			if (foundField != undefined)
			{
				data = foundField;
				break ;
			}
			skip.end = true;
			return (undefined);
		}
		else if (Array.isArray(data))
			break ;
		console.log(input);
		if (index != -1)
		{
			currKey = input.slice(0, index);
			input = input.slice(index + 1);
		}
		else
		{
			currKey = input;
			input = "";
		}//@ts-ignore
		data = data[currKey];
		if (data == undefined || data == null)
		{
			skip.end = true;
			return (undefined);
		}
		index = input.indexOf(".");
	}
	if (typeof(data) == "string")
		return (data);
	return (JSON.stringify(data, null, 0));
}

let x = 
{
	x0:
	[
		1,
		2,
		3
	],
	x1: 
	{
		x2:
		{
			x3:"Xx2-X3",
			y3:"Xx2-Y3"
		},
		y2:
		{
			x3:"Xy2-X3",
			y3:"Xy2-Y3"
		},
	},
	y1:
	{
		x2:
		{
			x3:"Yx2-X3",
			y3:"Yx2-Y3"
		},
		y2:
		{
			x3:"Yy2-X3",
			y3:"Yy2-Y3"
		},
		z:
		[
			{
				z1: "Z1",
				z2: "Z2"
			},
			{
				z1: "Z3",
				z2: "Z4"
			},
			{
				z1: "Z5",
				z2: "Z6"
			},
			[
				{
					z1: "Z7",
					z2: "Z8"
				},
				{
					z1: "Z9",
					z2: "Z10"
				},
			]
		]
	}
}

input = process.argv.at(2);
skipCounter = process.argv.at(3);
inputTemp = input;

if (!input)
{
	console.log("input a field (x1/x1.y2/y1.y2.x3/...)");
	process.exit(1);
}
if (skipCounter)
{
	skipCounter = {counter: skipCounter, end: false};
}
// data = x;
// index = input.indexOf(".");
// while (input.length != 0)
// {
// 	console.log(input);
// 	if (index != -1)
// 	{
// 		currKey = input.slice(0, index);
// 		input = input.slice(index + 1);
// 	}
// 	else
// 	{
// 		currKey = input;
// 		input = "";
// 	}
// 	data = data[currKey];
// 	if (!data)
// 	{
// 		console.log(`input ${inputTemp}: key ${currKey} is invalid`);
// 		process.exit(1);
// 	}
// 	index = input.indexOf(".");
// }

console.log("Result =>", resolveField(x, input, skipCounter));
if (skipCounter)
	console.log("Ended? =>", skipCounter);