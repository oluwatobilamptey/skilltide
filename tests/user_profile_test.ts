import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.2/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
  name: "User Profile: Successful profile creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const skills = ["TypeScript", "Blockchain"];
    
    const block = chain.mineBlock([
      Tx.contractCall('user_profile', 'create-profile', [
        types.ascii("testuser"),
        types.list(skills.map(s => types.ascii(s))),
        types.none(),
        types.none()
      ], deployer.address)
    ]);

    // Verify transaction was successful
    block.receipts[0].result.expectOk().expectBool(true);

    // Verify profile was created
    const profileResult = chain.callReadOnlyFn('user_profile', 'get-profile', 
      [types.principal(deployer.address)], 
      deployer.address
    );

    // Check profile details
    const profile = profileResult.result.expectSome();
    profile.expectTuple({
      username: types.ascii("testuser"),
      skills: types.list(skills.map(s => types.ascii(s))),
      location: types.none(),
      bio: types.none()
    });
  }
});

Clarinet.test({
  name: "User Profile: Prevent duplicate profile creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const skills = ["TypeScript", "Blockchain"];
    
    // First profile creation
    const block1 = chain.mineBlock([
      Tx.contractCall('user_profile', 'create-profile', [
        types.ascii("testuser"),
        types.list(skills.map(s => types.ascii(s))),
        types.none(),
        types.none()
      ], deployer.address)
    ]);
    block1.receipts[0].result.expectOk();

    // Attempt to create duplicate profile
    const block2 = chain.mineBlock([
      Tx.contractCall('user_profile', 'create-profile', [
        types.ascii("testuser"),
        types.list(skills.map(s => types.ascii(s))),
        types.none(),
        types.none()
      ], deployer.address)
    ]);

    // Verify duplicate creation fails
    block2.receipts[0].result.expectErr().expectUint(409); // ERR_PROFILE_ALREADY_EXISTS
  }
});

Clarinet.test({
  name: "User Profile: Update profile by owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const initialSkills = ["TypeScript", "Blockchain"];
    const updatedSkills = ["Python", "Cloud"];
    
    // First create a profile
    const block1 = chain.mineBlock([
      Tx.contractCall('user_profile', 'create-profile', [
        types.ascii("testuser"),
        types.list(initialSkills.map(s => types.ascii(s))),
        types.none(),
        types.none()
      ], deployer.address)
    ]);
    block1.receipts[0].result.expectOk();

    // Update profile
    const block2 = chain.mineBlock([
      Tx.contractCall('user_profile', 'update-profile', [
        types.list(updatedSkills.map(s => types.ascii(s))),
        types.none(),
        types.none()
      ], deployer.address)
    ]);

    // Verify update was successful
    block2.receipts[0].result.expectOk();

    // Check updated profile details
    const profileResult = chain.callReadOnlyFn('user_profile', 'get-profile', 
      [types.principal(deployer.address)], 
      deployer.address
    );

    const profile = profileResult.result.expectSome();
    profile.expectTuple({
      username: types.ascii("testuser"),
      skills: types.list(updatedSkills.map(s => types.ascii(s))),
      location: types.none(),
      bio: types.none()
    });
  }
});

Clarinet.test({
  name: "User Profile: Update profile by non-owner should fail",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const initialSkills = ["TypeScript", "Blockchain"];
    const updatedSkills = ["Python", "Cloud"];
    
    // Create profile for deployer
    const block1 = chain.mineBlock([
      Tx.contractCall('user_profile', 'create-profile', [
        types.ascii("testuser"),
        types.list(initialSkills.map(s => types.ascii(s))),
        types.none(),
        types.none()
      ], deployer.address)
    ]);
    block1.receipts[0].result.expectOk();

    // Try to update profile from different account 
    const block2 = chain.mineBlock([
      Tx.contractCall('user_profile', 'update-profile', [
        types.list(updatedSkills.map(s => types.ascii(s))),
        types.none(),
        types.none()
      ], wallet1.address)
    ]);

    // Verify update fails (profile not found)
    block2.receipts[0].result.expectErr().expectUint(404);
  }
});

Clarinet.test({
  name: "User Profile: Profile retrieval",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const skills = ["TypeScript", "Blockchain"];
    
    // Create profile
    const block1 = chain.mineBlock([
      Tx.contractCall('user_profile', 'create-profile', [
        types.ascii("testuser"),
        types.list(skills.map(s => types.ascii(s))),
        types.some(types.ascii("New York")),
        types.some(types.ascii("Software Developer"))
      ], deployer.address)
    ]);
    block1.receipts[0].result.expectOk();

    // Retrieve profile
    const profileResult = chain.callReadOnlyFn('user_profile', 'get-profile', 
      [types.principal(deployer.address)], 
      deployer.address
    );

    // Verify retrieved profile details
    const profile = profileResult.result.expectSome();
    profile.expectTuple({
      username: types.ascii("testuser"),
      skills: types.list(skills.map(s => types.ascii(s))),
      location: types.some(types.ascii("New York")),
      bio: types.some(types.ascii("Software Developer"))
    });
  }
});

Clarinet.test({
  name: "User Profile: Delete profile",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const skills = ["TypeScript", "Blockchain"];
    
    // Create profile
    const block1 = chain.mineBlock([
      Tx.contractCall('user_profile', 'create-profile', [
        types.ascii("testuser"),
        types.list(skills.map(s => types.ascii(s))),
        types.none(),
        types.none()
      ], deployer.address)
    ]);
    block1.receipts[0].result.expectOk();

    // Delete profile
    const block2 = chain.mineBlock([
      Tx.contractCall('user_profile', 'delete-profile', 
        [], 
        deployer.address
      )
    ]);

    // Verify deletion
    block2.receipts[0].result.expectOk();

    // Check profile no longer exists
    const profileResult = chain.callReadOnlyFn('user_profile', 'get-profile', 
      [types.principal(deployer.address)], 
      deployer.address
    );
    profileResult.result.expectNone();
  }
});

Clarinet.test({
  name: "User Profile: Input validation - Username length constraints",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const skills = ["TypeScript", "Blockchain"];
    
    // Test username too short
    const block1 = chain.mineBlock([
      Tx.contractCall('user_profile', 'create-profile', [
        types.ascii("a"),
        types.list(skills.map(s => types.ascii(s))),
        types.none(),
        types.none()
      ], deployer.address)
    ]);
    block1.receipts[0].result.expectErr().expectUint(400); // ERR_INVALID_INPUT

    // Test username too long
    const block2 = chain.mineBlock([
      Tx.contractCall('user_profile', 'create-profile', [
        types.ascii("a".repeat(51)),
        types.list(skills.map(s => types.ascii(s))),
        types.none(),
        types.none()
      ], deployer.address)
    ]);
    block2.receipts[0].result.expectErr().expectUint(400); // ERR_INVALID_INPUT
  }
});

Clarinet.test({
  name: "User Profile: Input validation - Skills list constraints",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Test empty skills list
    const block1 = chain.mineBlock([
      Tx.contractCall('user_profile', 'create-profile', [
        types.ascii("testuser"),
        types.list([]),
        types.none(),
        types.none()
      ], deployer.address)
    ]);
    block1.receipts[0].result.expectErr().expectUint(400); // ERR_INVALID_INPUT

    // Test skills list exceeding max length (defined as 10 in the contract)
    const longSkillsList = Array(11).fill(0).map((_, i) => types.ascii(`Skill${i}`));
    const block2 = chain.mineBlock([
      Tx.contractCall('user_profile', 'create-profile', [
        types.ascii("testuser"),
        types.list(longSkillsList),
        types.none(),
        types.none()
      ], deployer.address)
    ]);
    // Note: This test assumes the contract has runtime checks for list length
    // If not, you may need to modify the contract to include such a check
    block2.receipts[0].result.expectErr().expectUint(400); // ERR_INVALID_INPUT
  }
});

Clarinet.test({
  name: "User Profile: Authorization - Delete non-existent profile",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    // Attempt to delete non-existent profile
    const block = chain.mineBlock([
      Tx.contractCall('user_profile', 'delete-profile', 
        [], 
        wallet1.address
      )
    ]);

    // Verify deletion fails when no profile exists
    block.receipts[0].result.expectErr().expectUint(404); // ERR_PROFILE_NOT_FOUND
  }
});