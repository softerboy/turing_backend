const {
  validateRegisterForm: customer,
} = require('../../src/validators/customer')

const user = {
  name: 'John',
  email: 'john@doe.com',
  password: 'John@Doe123',
}

describe('Customer form validator', () => {
  it('should throw for empty name', done => {
    customer({ ...user, name: '' }).catch(() => done())
  })

  it('should throw if name is to short', done => {
    customer({ ...user, name: 'Jo' }).catch(() => done())
  })

  it('should throw if name is to long', done => {
    customer({
      ...user,
      name:
        'ThisIsAVeryLongNameWith70CharactersThisIsAVeryLongNameWith70Characters',
    }).catch(() => done())
  })

  it('should throw if name contains special characters', done => {
    customer({
      ...user,
      name: 'Jo@3h$n',
    }).catch(() => done())
  })

  it('should throw if name starts with a digit', done => {
    customer({
      ...user,
      name: '12John',
    }).catch(() => done())
  })

  it('should throw if email is empty', done => {
    customer({
      ...user,
      email: '',
    }).catch(() => done())
  })

  it('should throw if email is invalid', done => {
    customer({
      ...user,
      email: 'john$doe.com',
    }).catch(() => done())
  })

  it('should throw if email is to long', done => {
    const longEmail = 'email'.repeat('25').concat('@gmail.com')
    customer({
      ...user,
      email: longEmail,
    }).catch(() => done())
  })

  it('should throw if password is empty', done => {
    customer({
      ...user,
      password: '',
    }).catch(() => done())
  })

  // eslint-disable-next-line
  it("should throw if password don't contains uppercase letter", done => {
    customer({
      ...user,
      password: 'secret%1',
    }).catch(() => done())
  })

  /* eslint-disable quotes */
  it("should throw if password don't contains lowercase letter", done => {
    customer({
      ...user,
      password: 'SECRET%1',
    }).catch(() => done())
  })

  it("should throw if password don't contains at least one digit", done => {
    customer({
      ...user,
      password: 'seCr!et%a',
    }).catch(() => done())
  })

  it("should throw if password don't contains least one special character", done => {
    customer({
      ...user,
      password: 'seCr1eta',
    }).catch(() => done())
  })

  it('should throw if password length shorter than 6', done => {
    customer({
      ...user,
      password: 's%Cr1',
    }).catch(() => done())
  })

  it('should throw if password length longer than 50', done => {
    const longPassword = 's%Cr1'.repeat(11)
    customer({
      ...user,
      password: longPassword,
    }).catch(() => done())
  })
  /* eslint-enable quotes */

  it('should pass a valid user', () => customer(user))
})
