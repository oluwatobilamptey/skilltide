# Skilltide

## Project Overview

Skilltide is a decentralized platform for skill exchange with blockchain-powered location-based meetups. The project aims to facilitate the exchange of skills and knowledge between individuals by leveraging the power of the Stacks blockchain.

Key features of the Skilltide platform include:

- Secure, user-controlled profile management
- Location-based skill exchange meetups
- Transparent skill validation and reputation tracking
- Decentralized authentication and authorization

## Contract Architecture

The Skilltide project's core functionality is implemented in a Clarity smart contract called `user_profile.clar`. This contract provides the following features:

### Profile Structure
The contract uses a map called `user-profiles` to store user profile data, including:
- `username`: The user's display name (length constraint: 3-50 characters)
- `skills`: A list of up to 10 skills (length constraint: 1-10 skills)
- `location`: The user's location (optional)
- `bio`: A short bio about the user (optional)
- `created-at`: The timestamp when the profile was created

### Profile Management
The contract supports the following operations:

1. **Create Profile**: Users can create a new profile by providing their username, skills, location, and bio. The contract ensures that no duplicate profiles exist for a given user.
2. **Update Profile**: Users can update their existing profile, modifying the skills, location, and bio fields.
3. **Get Profile**: Users can retrieve their own profile data in a read-only manner.
4. **Delete Profile**: Users can delete their own profile.

### Error Handling
The contract defines several error codes to provide clear feedback on various failure scenarios, such as:
- `ERR_UNAUTHORIZED`: The user is not authorized to perform the requested action.
- `ERR_PROFILE_NOT_FOUND`: The requested profile does not exist.
- `ERR_PROFILE_ALREADY_EXISTS`: A profile for the given user already exists.
- `ERR_INVALID_INPUT`: The provided input data is invalid (e.g., username length, skills list length).

### Additional Features
- The contract maintains a `total-profiles` data variable to track the total number of user profiles.
- The contract includes input validation checks to ensure the integrity of the profile data.

## Installation & Setup

To use the Skilltide platform, you'll need the following:

1. **Clarinet**: The Clarity smart contract development and testing tool. You can install it following the [Clarinet documentation](https://clarineth.org/docs/getting-started).
2. **Stacks Blockchain**: The Stacks blockchain, which can be set up using the Clarinet configuration files provided in the `/settings` directory.

Once you have Clarinet and the Stacks blockchain set up, you can clone the Skilltide repository and run the project using the following steps:

1. Clone the repository: `git clone https://github.com/username/skilltide.git`
2. Navigate to the project directory: `cd skilltide`
3. Install dependencies: `clarinet install`
4. Run the tests: `clarinet test`
5. Deploy the contracts: `clarinet deploy`

## Usage Guide

Here are some examples of how to interact with the Skilltide user_profile contract:

### Create a new profile
```javascript
const username = "johndoe";
const skills = ["JavaScript", "React", "Blockchain"];
const location = "New York, NY";
const bio = "Software engineer with experience in web development and blockchain technology.";

const createProfileTx = await Clarinet.deployContract(
  "user_profile",
  "create-profile",
  [username, skills, location, bio]
);
```

### Update an existing profile
```javascript
const updatedSkills = ["Python", "AWS", "DevOps"];
const updatedLocation = "San Francisco, CA";
const updatedBio = "Experienced full-stack developer with a focus on cloud infrastructure.";

const updateProfileTx = await Clarinet.callContract(
  "user_profile",
  "update-profile",
  [updatedSkills, updatedLocation, updatedBio]
);
```

### Retrieve a user's profile
```javascript
const userAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const profileResult = await Clarinet.callReadOnlyFunction(
  "user_profile",
  "get-profile",
  [userAddress]
);
```

### Delete a user's profile
```javascript
const deleteProfileTx = await Clarinet.callContract(
  "user_profile",
  "delete-profile",
  []
);
```

## Testing

The Skilltide project includes a comprehensive test suite for the `user_profile` contract, located in the `/tests/user_profile_test.ts` file. These tests cover the following scenarios:

- Successful profile creation
- Preventing duplicate profile creation
- Updating a profile by the owner
- Attempting to update a profile by a non-owner
- Retrieving a user's profile
- Deleting a user's profile
- Input validation for username length
- Input validation for skills list length
- Attempting to delete a non-existent profile

To run the tests, use the following command:

```
clarinet test
```

## Security Considerations

The Skilltide user_profile contract includes several security measures to ensure the integrity and privacy of user data:

1. **Input Validation**: The contract performs thorough validation of input data, such as checking the length of the username and skills list. This helps prevent injection attacks and other malicious input.

2. **Authorization Checks**: The contract ensures that users can only perform actions on their own profiles, preventing unauthorized access or modification.

3. **Error Handling**: The contract provides clear and specific error codes to help users and developers understand the reason for any failures, aiding in debugging and troubleshooting.

4. **Data Structure Design**: The use of a map data structure to store user profiles, along with the inclusion of a creation timestamp, helps maintain the integrity and chronology of the profile data.

5. **No Token Operations**: The current version of the contract does not involve any token-related operations, which simplifies the attack surface and reduces the risk of vulnerabilities related to token handling.

While the contract appears to have a solid security foundation, it's essential to conduct regular security audits and assessments to identify and address any potential vulnerabilities that may arise over time.
