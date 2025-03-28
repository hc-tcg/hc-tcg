export const huffmanTree = [
	{symbol: '00', code: '0'},
	{symbol: '07', code: '10000'},
	{symbol: '01', code: '10001'},
	{symbol: '06', code: '10100'},
	{symbol: '02', code: '11100'},
	{symbol: '03', code: '11101'},
	{symbol: '80', code: '101010'},
	{symbol: '10', code: '101011'},
	{symbol: '05', code: '101100'},
	{symbol: '0b', code: '110111'},
	{symbol: '09', code: '111100'},
	{symbol: '0a', code: '111101'},
	{symbol: '04', code: '111111'},
	{symbol: '18', code: '1001011'},
	{symbol: '08', code: '1001101'},
	{symbol: '0c', code: '1011011'},
	{symbol: '70', code: '1011110'},
	{symbol: '0d', code: '10010100'},
	{symbol: 'd2', code: '10010101'},
	{symbol: 'b0', code: '10011001'},
	{symbol: '12', code: '10011100'},
	{symbol: '0e', code: '10011101'},
	{symbol: '20', code: '10110100'},
	{symbol: 'd8', code: '10111001'},
	{symbol: '60', code: '10111010'},
	{symbol: '50', code: '10111011'},
	{symbol: 'd0', code: '10111110'},
	{symbol: '0f', code: '10111111'},
	{symbol: '15', code: '11010010'},
	{symbol: '1b', code: '11111001'},
	{symbol: '11', code: '11111010'},
	{symbol: '56', code: '11111011'},
	{symbol: 'da', code: '100110000'},
	{symbol: '5e', code: '100110001'},
	{symbol: 'f0', code: '100111100'},
	{symbol: 'c0', code: '100111101'},
	{symbol: '19', code: '100111110'},
	{symbol: 'e0', code: '100111111'},
	{symbol: '61', code: '101101010'},
	{symbol: '30', code: '101101011'},
	{symbol: 'c8', code: '101110000'},
	{symbol: '13', code: '101110001'},
	{symbol: '2a', code: '110110000'},
	{symbol: '14', code: '110110010'},
	{symbol: '26', code: '110110011'},
	{symbol: '1c', code: '111110000'},
	{symbol: '16', code: '111110001'},
	{symbol: '62', code: '1001000000'},
	{symbol: 'b1', code: '1001000001'},
	{symbol: '21', code: '1001000010'},
	{symbol: 'ad', code: '1001000011'},
	{symbol: '31', code: '1001000100'},
	{symbol: '9d', code: '1001000101'},
	{symbol: 'ee', code: '1001000110'},
	{symbol: '68', code: '1001000111'},
	{symbol: 'b5', code: '1001001000'},
	{symbol: '2e', code: '1001001001'},
	{symbol: '25', code: '1001001010'},
	{symbol: 'cc', code: '1001001011'},
	{symbol: '4e', code: '1001001100'},
	{symbol: 'd4', code: '1001001101'},
	{symbol: 'ca', code: '1001001110'},
	{symbol: '1d', code: '1001001111'},
	{symbol: '24', code: '1101000000'},
	{symbol: '1e', code: '1101000001'},
	{symbol: '28', code: '1101000010'},
	{symbol: '27', code: '1101000011'},
	{symbol: '1a', code: '1101000110'},
	{symbol: '17', code: '1101000111'},
	{symbol: '66', code: '1101001100'},
	{symbol: '49', code: '1101001101'},
	{symbol: 'e2', code: '1101001110'},
	{symbol: 'dc', code: '1101001111'},
	{symbol: 'b3', code: '11000000000'},
	{symbol: 'b2', code: '11000000001'},
	{symbol: 'b6', code: '11000000010'},
	{symbol: 'b4', code: '11000000011'},
	{symbol: 'ac', code: '11000000100'},
	{symbol: 'ab', code: '11000000101'},
	{symbol: 'af', code: '11000000110'},
	{symbol: 'ae', code: '11000000111'},
	{symbol: 'bc', code: '11000001000'},
	{symbol: 'bb', code: '11000001001'},
	{symbol: 'be', code: '11000001010'},
	{symbol: 'bd', code: '11000001011'},
	{symbol: 'b8', code: '11000001100'},
	{symbol: 'b7', code: '11000001101'},
	{symbol: 'ba', code: '11000001110'},
	{symbol: 'b9', code: '11000001111'},
	{symbol: 'a0', code: '11000010000'},
	{symbol: '9f', code: '11000010001'},
	{symbol: 'a2', code: '11000010010'},
	{symbol: 'a1', code: '11000010011'},
	{symbol: '9b', code: '11000010100'},
	{symbol: '9a', code: '11000010101'},
	{symbol: '9e', code: '11000010110'},
	{symbol: '9c', code: '11000010111'},
	{symbol: 'a8', code: '11000011000'},
	{symbol: 'a7', code: '11000011001'},
	{symbol: 'aa', code: '11000011010'},
	{symbol: 'a9', code: '11000011011'},
	{symbol: 'a4', code: '11000011100'},
	{symbol: 'a3', code: '11000011101'},
	{symbol: 'a6', code: '11000011110'},
	{symbol: 'a5', code: '11000011111'},
	{symbol: 'de', code: '11000100000'},
	{symbol: 'dd', code: '11000100001'},
	{symbol: 'e1', code: '11000100010'},
	{symbol: 'df', code: '11000100011'},
	{symbol: 'd7', code: '11000100100'},
	{symbol: 'd6', code: '11000100101'},
	{symbol: 'db', code: '11000100110'},
	{symbol: 'd9', code: '11000100111'},
	{symbol: 'e8', code: '11000101000'},
	{symbol: 'e7', code: '11000101001'},
	{symbol: 'ea', code: '11000101010'},
	{symbol: 'e9', code: '11000101011'},
	{symbol: 'e4', code: '11000101100'},
	{symbol: 'e3', code: '11000101101'},
	{symbol: 'e6', code: '11000101110'},
	{symbol: 'e5', code: '11000101111'},
	{symbol: 'c5', code: '11000110000'},
	{symbol: 'c4', code: '11000110001'},
	{symbol: 'c7', code: '11000110010'},
	{symbol: 'c6', code: '11000110011'},
	{symbol: 'c1', code: '11000110100'},
	{symbol: 'bf', code: '11000110101'},
	{symbol: 'c3', code: '11000110110'},
	{symbol: 'c2', code: '11000110111'},
	{symbol: 'd1', code: '11000111000'},
	{symbol: 'cf', code: '11000111001'},
	{symbol: 'd5', code: '11000111010'},
	{symbol: 'd3', code: '11000111011'},
	{symbol: 'cb', code: '11000111100'},
	{symbol: 'c9', code: '11000111101'},
	{symbol: 'ce', code: '11000111110'},
	{symbol: 'cd', code: '11000111111'},
	{symbol: '6d', code: '11001000000'},
	{symbol: '6c', code: '11001000001'},
	{symbol: '6f', code: '11001000010'},
	{symbol: '6e', code: '11001000011'},
	{symbol: '69', code: '11001000100'},
	{symbol: '67', code: '11001000101'},
	{symbol: '6b', code: '11001000110'},
	{symbol: '6a', code: '11001000111'},
	{symbol: '76', code: '11001001000'},
	{symbol: '75', code: '11001001001'},
	{symbol: '78', code: '11001001010'},
	{symbol: '77', code: '11001001011'},
	{symbol: '72', code: '11001001100'},
	{symbol: '71', code: '11001001101'},
	{symbol: '74', code: '11001001110'},
	{symbol: '73', code: '11001001111'},
	{symbol: '57', code: '11001010000'},
	{symbol: '55', code: '11001010001'},
	{symbol: '59', code: '11001010010'},
	{symbol: '58', code: '11001010011'},
	{symbol: '52', code: '11001010100'},
	{symbol: '51', code: '11001010101'},
	{symbol: '54', code: '11001010110'},
	{symbol: '53', code: '11001010111'},
	{symbol: '63', code: '11001011000'},
	{symbol: '5f', code: '11001011001'},
	{symbol: '65', code: '11001011010'},
	{symbol: '64', code: '11001011011'},
	{symbol: '5b', code: '11001011100'},
	{symbol: '5a', code: '11001011101'},
	{symbol: '5d', code: '11001011110'},
	{symbol: '5c', code: '11001011111'},
	{symbol: '8f', code: '11001100000'},
	{symbol: '8e', code: '11001100001'},
	{symbol: '91', code: '11001100010'},
	{symbol: '90', code: '11001100011'},
	{symbol: '8b', code: '11001100100'},
	{symbol: '8a', code: '11001100101'},
	{symbol: '8d', code: '11001100110'},
	{symbol: '8c', code: '11001100111'},
	{symbol: '97', code: '11001101000'},
	{symbol: '96', code: '11001101001'},
	{symbol: '99', code: '11001101010'},
	{symbol: '98', code: '11001101011'},
	{symbol: '93', code: '11001101100'},
	{symbol: '92', code: '11001101101'},
	{symbol: '95', code: '11001101110'},
	{symbol: '94', code: '11001101111'},
	{symbol: '7e', code: '11001110000'},
	{symbol: '7d', code: '11001110001'},
	{symbol: '81', code: '11001110010'},
	{symbol: '7f', code: '11001110011'},
	{symbol: '7a', code: '11001110100'},
	{symbol: '79', code: '11001110101'},
	{symbol: '7c', code: '11001110110'},
	{symbol: '7b', code: '11001110111'},
	{symbol: '87', code: '11001111000'},
	{symbol: '86', code: '11001111001'},
	{symbol: '89', code: '11001111010'},
	{symbol: '88', code: '11001111011'},
	{symbol: '83', code: '11001111100'},
	{symbol: '82', code: '11001111101'},
	{symbol: '85', code: '11001111110'},
	{symbol: '84', code: '11001111111'},
	{symbol: '22', code: '11010001000'},
	{symbol: '1f', code: '11010001001'},
	{symbol: '29', code: '11010001010'},
	{symbol: '23', code: '11010001011'},
	{symbol: '43', code: '11010100000'},
	{symbol: '42', code: '11010100001'},
	{symbol: '45', code: '11010100010'},
	{symbol: '44', code: '11010100011'},
	{symbol: '3f', code: '11010100100'},
	{symbol: '3e', code: '11010100101'},
	{symbol: '41', code: '11010100110'},
	{symbol: '40', code: '11010100111'},
	{symbol: '4c', code: '11010101000'},
	{symbol: '4b', code: '11010101001'},
	{symbol: '4f', code: '11010101010'},
	{symbol: '4d', code: '11010101011'},
	{symbol: '47', code: '11010101100'},
	{symbol: '46', code: '11010101101'},
	{symbol: '4a', code: '11010101110'},
	{symbol: '48', code: '11010101111'},
	{symbol: '33', code: '11010110000'},
	{symbol: '32', code: '11010110001'},
	{symbol: '35', code: '11010110010'},
	{symbol: '34', code: '11010110011'},
	{symbol: '2c', code: '11010110100'},
	{symbol: '2b', code: '11010110101'},
	{symbol: '2f', code: '11010110110'},
	{symbol: '2d', code: '11010110111'},
	{symbol: '3b', code: '11010111000'},
	{symbol: '3a', code: '11010111001'},
	{symbol: '3d', code: '11010111010'},
	{symbol: '3c', code: '11010111011'},
	{symbol: '37', code: '11010111100'},
	{symbol: '36', code: '11010111101'},
	{symbol: '39', code: '11010111110'},
	{symbol: '38', code: '11010111111'},
	{symbol: 'fe', code: '11011000100'},
	{symbol: 'fd', code: '11011000101'},
	{symbol: 'EOF', code: '11011000110'},
	{symbol: 'ff', code: '11011000111'},
	{symbol: 'f2', code: '11011010000'},
	{symbol: 'f1', code: '11011010001'},
	{symbol: 'f4', code: '11011010010'},
	{symbol: 'f3', code: '11011010011'},
	{symbol: 'ec', code: '11011010100'},
	{symbol: 'eb', code: '11011010101'},
	{symbol: 'ef', code: '11011010110'},
	{symbol: 'ed', code: '11011010111'},
	{symbol: 'fa', code: '11011011000'},
	{symbol: 'f9', code: '11011011001'},
	{symbol: 'fc', code: '11011011010'},
	{symbol: 'fb', code: '11011011011'},
	{symbol: 'f6', code: '11011011100'},
	{symbol: 'f5', code: '11011011101'},
	{symbol: 'f8', code: '11011011110'},
	{symbol: 'f7', code: '11011011111'},
]
