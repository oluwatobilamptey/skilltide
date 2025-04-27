;; Skilltide User Profile Contract
;; A secure, blockchain-powered user profile management system
;; Supports profile creation, updates, and basic management

;; Error Codes
(define-constant ERR_UNAUTHORIZED u403)
(define-constant ERR_PROFILE_NOT_FOUND u404)
(define-constant ERR_PROFILE_ALREADY_EXISTS u409)
(define-constant ERR_INVALID_INPUT u400)

;; Profile Structure
(define-map user-profiles 
  principal 
  {
    username: (string-ascii 50),
    skills: (list 10 (string-ascii 30)),
    location: (optional (string-ascii 100)),
    bio: (optional (string-ascii 500)),
    created-at: uint
  }
)

;; Helper function to validate username
(define-private (is-valid-username (username (string-ascii 50)))
  (and 
    (> (len username) u2)
    (< (len username) u51)
  )
)

;; Track total number of profiles
(define-data-var total-profiles uint u0)

;; Create a new user profile
(define-public (create-profile 
  (username (string-ascii 50))
  (skills (list 10 (string-ascii 30)))
  (location (optional (string-ascii 100)))
  (bio (optional (string-ascii 500)))
)
  (begin
    ;; Validate inputs
    (asserts! (is-valid-username username) (err ERR_INVALID_INPUT))
    (asserts! (> (len skills) u0) (err ERR_INVALID_INPUT))
    (asserts! (< (len skills) u11) (err ERR_INVALID_INPUT))
    
    ;; Check if profile already exists
    (asserts! (is-none (map-get? user-profiles tx-sender)) (err ERR_PROFILE_ALREADY_EXISTS))
    
    ;; Create profile
    (map-set user-profiles tx-sender {
      username: username,
      skills: skills,
      location: location,
      bio: bio,
      created-at: block-height
    })
    
    ;; Increment total profiles
    (var-set total-profiles (+ (var-get total-profiles) u1))
    
    (ok true)
  )
)

;; Update existing profile
(define-public (update-profile 
  (skills (list 10 (string-ascii 30)))
  (location (optional (string-ascii 100)))
  (bio (optional (string-ascii 500)))
)
  (let ((existing-profile (map-get? user-profiles tx-sender)))
    (match existing-profile
      profile
        ;; Profile exists, update it
        (begin
          (map-set user-profiles tx-sender (merge profile {
            skills: skills,
            location: location,
            bio: bio
          }))
          (ok true)
        )
      ;; No existing profile
      (err ERR_PROFILE_NOT_FOUND)
    )
  )
)

;; Get user profile (read-only)
(define-read-only (get-profile (user principal))
  (map-get? user-profiles user)
)

;; Delete user profile
(define-public (delete-profile)
  (begin
    ;; Ensure profile exists
    (asserts! (is-some (map-get? user-profiles tx-sender)) (err ERR_PROFILE_NOT_FOUND))
    
    ;; Delete profile
    (map-delete user-profiles tx-sender)
    (ok true)
  )
)

;; Optional: Count total number of user profiles
(define-read-only (get-total-profiles)
  (len (map-keys user-profiles))
)