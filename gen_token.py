"""
@author Mqtth3w https://github.com/Mqtth3w
@license GPL-3.0
"""

import random
import string

def generate_token(length=256):
    # Define the allowed characters: A-Z, a-z, 0-9, _, and -
    characters = string.ascii_letters + string.digits + "_-"
    # Ensure the token length is within the allowed range (1-256)
    if not (1 <= length <= 256):
        raise ValueError("Token length must be between 1 and 256 characters.")
    # Generate a random token using the allowed characters
    token = ''.join(random.choice(characters) for _ in range(length))
    return token

# Generate a X-character token
secret_token = generate_token(32)
print("Generated Token:", secret_token)
