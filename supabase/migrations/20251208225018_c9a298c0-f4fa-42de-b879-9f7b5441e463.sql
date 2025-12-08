
-- Create a function to handle loan status change notifications
CREATE OR REPLACE FUNCTION public.handle_loan_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger when status changes from pending to approved or rejected
  IF OLD.status = 'pending' AND (NEW.status = 'approved' OR NEW.status = 'rejected') THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      category,
      action_url
    ) VALUES (
      NEW.user_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Loan Approved! 🎉'
        ELSE 'Loan Application Update'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 
          'Your loan request for ₹' || NEW.requested_amount || ' has been approved! Approved amount: ₹' || COALESCE(NEW.approved_amount, NEW.requested_amount) || ' at ' || COALESCE(NEW.interest_rate, 7.5) || '% interest.'
        ELSE 
          'Your loan request for ₹' || NEW.requested_amount || ' was not approved. ' || COALESCE(NEW.rejection_reason, 'Please contact support for more details.')
      END,
      CASE WHEN NEW.status = 'approved' THEN 'success' ELSE 'warning' END,
      'loan',
      '/microfinance'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for loan status changes
DROP TRIGGER IF EXISTS on_loan_status_change ON public.farmer_loans;
CREATE TRIGGER on_loan_status_change
  AFTER UPDATE ON public.farmer_loans
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.handle_loan_status_change();
