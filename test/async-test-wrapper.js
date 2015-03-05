export default function(test, done) {
  try {
    test();
    done();
  } catch (e) {
    done(e);
  }
};

