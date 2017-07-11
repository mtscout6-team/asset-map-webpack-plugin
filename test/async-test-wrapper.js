export default (test, done) => {
  try {
    test();
    done();
  } catch (e) {
    done(e);
  }
};

