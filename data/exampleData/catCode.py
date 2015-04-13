##############################################################
# How to use the program:				    ##	
# ./catCode.py [NumberOfPasswords] [LengthOfPassword]  ##
# Example: ./passwordGen.py 10 15                        ##
# Use chmod a+x [filename] to run the program               ##
##############################################################

import random
import math
import sys
import argparse
import string
from datetime import date

now = date.today()

charPool  = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=', '<', '>', '?', '/', '{', '[', '}', ']', '|', '$', ':', ';', ',', '.'] 

def makeRandomPassword(length):
	S = ""
	for i in range(length):
		S += random.choice(charPool)

	return S

# If any function returns False, reject the password.  This allows you to apply a list of requirements
# to a password, and reject it if it fails any of them.  We just keep generating random passwords till
# something passes, or some password generating attempt takes too long--then we give up.  
#

def rejectionSamplePassword(length, list_of_functions):

	# Do this as a for loop to recover from endless loops from unattainable conditions.
	for i in range(100000):

		P = makeRandomPassword(length)
		okay_flag = True

		for f in list_of_functions:
			okay_flag = okay_flag and f(P)

		if okay_flag: return P

	raise ValueError("Got stuck in an infinite loop--you probably have some impossible conditions.")

# Put this function in to get no rejections.  
def alwaysPass(P):
	return True

# Require one of each type.
def oneOfEach(P):

	upper_flag = False
	lower_flag = False
	digit_flag = False
	symbol_flag = False

	for ch in P:
		if ch in string.ascii_uppercase: 
			upper_flag = True

		elif ch in string.ascii_lowercase: 
			lower_flag = True

		elif ch in string.digits:
			digit_flag = True

		else:
			symbol_flag = True

	return upper_flag and lower_flag and digit_flag and symbol_flag

def dontStartWithUppercase(P):
	if P[0] in string.ascii_uppercase:
		return False

	else: 
		return True

def dontEndWithPunctuation(P):
	if P[-1] == "." or P[-1] == "?" or P[-1] == "!": 
		return False

	else:
		return True

def generateRuledPassword(length):
	flist = [oneOfEach, dontStartWithUppercase, dontEndWithPunctuation]
	return rejectionSamplePassword(length, flist)


# COUNT CHARACTER TYPES
def countCategories(P):

	upper = 0
	lower = 0
	digit = 0
	symbol = 0

	for ch in P:
		if ch in string.ascii_uppercase: 
			upper += 1
		elif ch in string.ascii_lowercase: 
			lower += 1
		elif ch in string.digits:
			digit += 1
		else:
			symbol += 1

	return upper, lower, digit, symbol

def generatePasswordListFile(length, number):
	# Clear and open a file for writing
	tempResults = 'catCode-results-' + str(now) + '.txt'
	resultsFile = open(tempResults, "w")

	resultsFile.close()
	resultsFile = open(tempResults, "a")

	for x in range(0, number):
		generatedPassword = generateRuledPassword(length)
		print(generatedPassword)
		resultsFile.write(generatedPassword + "\n")

	resultsFile.close()

now = date.today()

numberOfPasswords = sys.argv[1]
lengthOfPassword = sys.argv[2]
numberOfPasswords = int(numberOfPasswords)
lengthOfPassword = int(lengthOfPassword)

generatePasswordListFile(lengthOfPassword, numberOfPasswords)